# AI-Based Waste Prediction Engine

The trained forecasting and XGBoost risk-scoring artifacts are exposed through a FastAPI service.

## Run locally

From the repository root, install the dependencies and start the service:

```powershell
python -m pip install -r ai-service/requirements.txt
cd ai-service
python -m uvicorn app.main:app --reload --port 8000
```

Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`. The service loads the XGBoost artifact once at startup. Its endpoints are `GET /health`, `POST /predict/risk-score`, `POST /predict/batch`, and `GET /predict/reorder-recommendation`.

## Downstream prediction contract

Every scored inventory item uses this contract for Node.js / PostgreSQL:

```json
{
  "inventory_id": "inv-123",
  "business_id": "business-456",
  "risk_score": 82.14,
  "risk_tier": "high",
  "risk_probabilities": {"low": 0.02, "medium": 0.16, "high": 0.82},
  "reorder_recommendation": {"recommended_purchase_quantity": 0.0, "target_stock": 20.0, "storage_capacity": 100.0},
  "model_version": "risk_scoring_xgboost_v1",
  "predicted_at": "2026-08-13T00:00:00+00:00"
}
```

`POST /predict/batch` writes one contract object per line to the ignored local outbox `ai-service/runtime/prediction_outbox.jsonl`. APScheduler runs on `BATCH_PREDICTION_INTERVAL_SECONDS` (default: 3600 seconds; minimum: 60) and reads `ai-service/runtime/active_inventory.json` when present. That temporary JSON array must contain the request item fields plus `business_id`.

To replace the stub, Node.js should either call `/predict/batch` with its active inventory or implement an adapter that reads active inventory from PostgreSQL and persists each outbox contract into `PREDICTIONS`. No database or Node.js integration is included here.
