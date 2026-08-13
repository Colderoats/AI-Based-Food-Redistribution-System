"""Prediction orchestration and the temporary local outbox adapter."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from risk_scoring.predict import load_model_artifacts, predict_item, recommend_reorder

from .schemas import InventoryItem


SERVICE_ROOT = Path(__file__).resolve().parents[1]
RUNTIME_DIR = SERVICE_ROOT / "runtime"
OUTBOX_FILE = RUNTIME_DIR / "prediction_outbox.jsonl"
ACTIVE_INVENTORY_FILE = RUNTIME_DIR / "active_inventory.json"


class PredictionService:
    def __init__(self) -> None:
        self.model, self.metadata = load_model_artifacts()

    def score_item(self, business_id: str, item: InventoryItem) -> dict[str, Any]:
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

    def score_batch(self, business_id: str, inventory: list[InventoryItem]) -> list[dict[str, Any]]:
        return [self.score_item(business_id, item) for item in inventory]

    def write_outbox(self, predictions: list[dict[str, Any]]) -> str:
        RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
        with OUTBOX_FILE.open("a", encoding="utf-8") as output:
            for prediction in predictions:
                output.write(json.dumps(prediction) + "\n")
        return str(OUTBOX_FILE.relative_to(SERVICE_ROOT))

    def run_scheduled_batch(self) -> None:
        """Score a local active-inventory snapshot until the DB adapter is implemented."""
        if not ACTIVE_INVENTORY_FILE.exists():
            return
        records = json.loads(ACTIVE_INVENTORY_FILE.read_text(encoding="utf-8"))
        grouped: dict[str, list[InventoryItem]] = {}
        for record in records:
            business_id = record.pop("business_id")
            grouped.setdefault(business_id, []).append(InventoryItem(**record))
        for business_id, inventory in grouped.items():
            self.write_outbox(self.score_batch(business_id, inventory))

    @staticmethod
    def reorder(demand_forecast: float, current_stock: float, storage_capacity: float, safety_stock_days: float) -> dict:
        return recommend_reorder(demand_forecast, current_stock, storage_capacity, safety_stock_days)
