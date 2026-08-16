"""Standalone Part 3 prediction functions; no web framework dependency."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from xgboost import XGBClassifier


ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT / "ai-service" / "models" / "risk_scoring"


def load_model_artifacts() -> tuple[XGBClassifier, dict]:
    """Load the risk model once for a long-running caller such as FastAPI."""
    metadata = json.loads((MODEL_DIR / "risk_scoring_metadata_v1.json").read_text(encoding="utf-8"))
    model = XGBClassifier()
    model.load_model(MODEL_DIR / "risk_scoring_xgboost_v1.json")
    return model, metadata


def recommend_reorder(demand_forecast: float, current_stock: float, storage_capacity: float, safety_stock_days: float = 2) -> dict:
    """Recommend up to the capacity left after retaining forecast safety stock."""
    target_stock = min(max(0.0, demand_forecast * safety_stock_days), max(0.0, storage_capacity))
    quantity = min(max(0.0, target_stock - current_stock), max(0.0, storage_capacity - current_stock))
    return {"recommended_purchase_quantity": round(quantity, 2), "target_stock": round(target_stock, 2), "storage_capacity": storage_capacity}


def predict_item(*, category: str, days_to_expiry: float, current_stock: float, demand_forecast: float,
                 historical_damaged_stock_total: float = 0, order_count: float = 0,
                 unique_products: float = 1, month: int = 1, is_weekend: bool = False,
                 storage_capacity: float = 100, model: XGBClassifier | None = None,
                 metadata: dict | None = None) -> dict:
    """Return an XGBoost risk score/tier and a capacity-constrained reorder recommendation."""
    if model is None or metadata is None:
        model, metadata = load_model_artifacts()
    category_codes = metadata["category_codes"]
    if category not in category_codes:
        raise ValueError(f"Unknown category: {category}. Expected one of {sorted(category_codes)}")
    historical_rate = np.log1p(max(0, historical_damaged_stock_total)) / np.log1p(metadata["historical_damage_max"])
    values = [[days_to_expiry, current_stock, demand_forecast, historical_rate, order_count,
               unique_products, month, int(is_weekend), category_codes[category]]]
    probabilities = model.predict_proba(values)[0]
    tier_index = int(np.argmax(probabilities))
    return {
        "risk_score": round(float(probabilities[2]) * 100, 2),
        "risk_tier": metadata["risk_tiers"][str(tier_index)],
        "risk_probabilities": {metadata["risk_tiers"][str(index)]: round(float(value), 4) for index, value in enumerate(probabilities)},
        "reorder_recommendation": recommend_reorder(demand_forecast, current_stock, storage_capacity),
    }
