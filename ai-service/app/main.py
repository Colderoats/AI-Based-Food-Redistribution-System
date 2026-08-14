"""HTTP entry point for the AI-Based Waste Prediction Engine."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Annotated

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, HTTPException, Query, Request

from .schemas import (
    BatchPredictionRequest, BatchPredictionResponse, HealthResponse, PredictionResult,
    ReorderRecommendationRequest, ReorderRecommendationResponse, RiskScoreRequest,
)
from .services import PredictionService


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.prediction_service = PredictionService()
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(
        app.state.prediction_service.run_scheduled_batch,
        "interval",
        seconds=max(60, int(os.getenv("BATCH_PREDICTION_INTERVAL_SECONDS", "3600"))),
        id="scheduled-waste-risk-scoring",
        replace_existing=True,
    )
    scheduler.start()
    app.state.scheduler = scheduler
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="AI-Based Waste Prediction Engine",
    version="1.0.0",
    description="Risk scoring and reorder recommendations for food inventory.",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse, tags=["Service"])
def health(request: Request) -> HealthResponse:
    return HealthResponse(status="ok", model_loaded=hasattr(request.app.state, "prediction_service"), scheduler_running=request.app.state.scheduler.running)


@app.post("/predict/risk-score", response_model=PredictionResult, tags=["Predictions"])
def risk_score(payload: RiskScoreRequest, request: Request) -> PredictionResult:
    try:
        return PredictionResult(**request.app.state.prediction_service.score_item(payload.business_id, payload))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Predictions"])
def batch_predict(payload: BatchPredictionRequest, request: Request) -> BatchPredictionResponse:
    try:
        service = request.app.state.prediction_service
        predictions = service.score_batch(payload.business_id, payload.inventory)
        service.persist_predictions(predictions)
        return BatchPredictionResponse(
            business_id=payload.business_id,
            prediction_count=len(predictions),
            predictions=predictions,
            delivery="postgres",
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/predict/reorder-recommendation", response_model=ReorderRecommendationResponse, tags=["Predictions"])
def reorder_recommendation(
    demand_forecast: Annotated[float, Query(ge=0)],
    current_stock: Annotated[float, Query(ge=0)],
    storage_capacity: Annotated[float, Query(ge=0)],
    safety_stock_days: Annotated[float, Query(gt=0)] = 2,
) -> ReorderRecommendationResponse:
    payload = ReorderRecommendationRequest(
        demand_forecast=demand_forecast,
        current_stock=current_stock,
        storage_capacity=storage_capacity,
        safety_stock_days=safety_stock_days,
    )
    return ReorderRecommendationResponse(**PredictionService.reorder(**payload.model_dump()))
