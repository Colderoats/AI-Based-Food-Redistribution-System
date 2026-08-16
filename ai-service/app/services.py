"""Prediction orchestration and PostgreSQL persistence adapters."""

from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from risk_scoring.predict import load_model_artifacts, predict_item, recommend_reorder

from .schemas import InventoryItem


MODEL_CATEGORIES = {"Beverages", "Dairy", "Dry Goods", "Frozen Foods", "Fruits", "Other", "Snacks"}
FALLBACK_DAILY_DEMAND = 1
SERVICE_ROOT = Path(__file__).resolve().parents[1]

# Local development shares the backend's database configuration; deployed
# environments should provide these variables directly and take precedence.
load_dotenv(SERVICE_ROOT.parent / "server" / ".env")


def database_url() -> str:
    """Use DATABASE_URL when supplied, otherwise share the Node/PostgreSQL env contract."""
    if url := os.getenv("DATABASE_URL"):
        return url
    return "host={host} port={port} dbname={database} user={user} password={password}".format(
        host=os.getenv("DB_HOST", "localhost"), port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "food_redistribution"), user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
    )


class PredictionService:
    def __init__(self) -> None:
        self.model, self.metadata = load_model_artifacts()

    def score_item(self, business_id: int, item: InventoryItem) -> dict[str, Any]:
        scored = predict_item(
            **item.model_dump(exclude={"inventory_id", "business_id"}), model=self.model, metadata=self.metadata
        )
        return {
            "inventory_id": item.inventory_id,
            "business_id": business_id,
            **scored,
            "model_version": "risk_scoring_xgboost_v1",
            "predicted_at": datetime.now(timezone.utc).isoformat(),
        }

    def score_batch(self, business_id: int, inventory: list[InventoryItem]) -> list[dict[str, Any]]:
        return [self.score_item(business_id, item) for item in inventory]

    def persist_predictions(self, predictions: list[dict[str, Any]]) -> None:
        if not predictions:
            return
        with psycopg.connect(database_url()) as connection:
            with connection.cursor() as cursor:
                cursor.executemany(
                    """INSERT INTO predictions (inventory_id, business_id, risk_score, risk_tier, risk_probabilities,
                       reorder_recommendation, model_version, predicted_at)
                       VALUES (%(inventory_id)s, %(business_id)s, %(risk_score)s, %(risk_tier)s,
                       %(risk_probabilities)s, %(reorder_recommendation)s, %(model_version)s, %(predicted_at)s)""",
                    [{**prediction, "risk_probabilities": Jsonb(prediction["risk_probabilities"]),
                      "reorder_recommendation": Jsonb(prediction["reorder_recommendation"])} for prediction in predictions],
                )

    def run_scheduled_batch(self) -> None:
        """Read current inventory from PostgreSQL and persist one new prediction per item."""
        with psycopg.connect(database_url(), row_factory=dict_row) as connection:
            with connection.cursor() as cursor:
                cursor.execute("""SELECT i.inventory_id, p.business_id, p.category, i.quantity, i.expiry_date
                    FROM inventory i JOIN product p ON p.product_id = i.product_id
                    WHERE i.expiry_date >= CURRENT_DATE AND i.quantity > 0""")
                records = cursor.fetchall()
        grouped: dict[int, list[InventoryItem]] = {}
        now = datetime.now(timezone.utc)
        for record in records:
            category = record["category"] if record["category"] in MODEL_CATEGORIES else "Other"
            days_to_expiry = max(0, (record["expiry_date"] - now.date()).days)
            item = InventoryItem(inventory_id=record["inventory_id"], category=category,
                days_to_expiry=days_to_expiry, current_stock=float(record["quantity"]),
                demand_forecast=FALLBACK_DAILY_DEMAND,
                storage_capacity=max(float(record["quantity"]), 100))
            grouped.setdefault(record["business_id"], []).append(item)
        for business_id, inventory in grouped.items():
            self.persist_predictions(self.score_batch(business_id, inventory))

    @staticmethod
    def reorder(demand_forecast: float, current_stock: float, storage_capacity: float, safety_stock_days: float) -> dict:
        return recommend_reorder(demand_forecast, current_stock, storage_capacity, safety_stock_days)
