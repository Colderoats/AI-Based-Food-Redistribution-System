"""Validated HTTP contracts for the prediction service."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


class InventoryItem(BaseModel):
    inventory_id: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=100)
    days_to_expiry: float = Field(ge=0)
    current_stock: float = Field(ge=0)
    demand_forecast: float = Field(ge=0)
    historical_damaged_stock_total: float = Field(default=0, ge=0)
    order_count: float = Field(default=0, ge=0)
    unique_products: float = Field(default=1, ge=0)
    month: int = Field(default=1, ge=1, le=12)
    is_weekend: bool = False
    storage_capacity: float = Field(default=100, ge=0)


class RiskScoreRequest(InventoryItem):
    business_id: str = Field(min_length=1, max_length=100)


class BatchPredictionRequest(BaseModel):
    business_id: str = Field(min_length=1, max_length=100)
    inventory: list[InventoryItem] = Field(min_length=1)


class ReorderRecommendationRequest(BaseModel):
    demand_forecast: float = Field(ge=0)
    current_stock: float = Field(ge=0)
    storage_capacity: float = Field(ge=0)
    safety_stock_days: float = Field(default=2, gt=0)


class ReorderRecommendationResponse(BaseModel):
    recommended_purchase_quantity: float
    target_stock: float
    storage_capacity: float


class PredictionResult(BaseModel):
    inventory_id: str
    business_id: str
    risk_score: float = Field(ge=0, le=100)
    risk_tier: Literal["low", "medium", "high"]
    risk_probabilities: dict[str, float]
    reorder_recommendation: ReorderRecommendationResponse
    model_version: str = "risk_scoring_xgboost_v1"
    predicted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BatchPredictionResponse(BaseModel):
    business_id: str
    prediction_count: int
    predictions: list[PredictionResult]
    delivery: Literal["local_json_outbox"] = "local_json_outbox"
    outbox_file: str


class HealthResponse(BaseModel):
    status: Literal["ok"]
    model_loaded: bool
    scheduler_running: bool
