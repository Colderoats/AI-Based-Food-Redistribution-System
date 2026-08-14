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

`POST /predict/batch` persists its returned predictions to PostgreSQL. APScheduler also reads live active `inventory` rows from PostgreSQL and persists a fresh prediction for each item on `BATCH_PREDICTION_INTERVAL_SECONDS` (default: 3600 seconds; minimum: 60). Set that environment variable to a shorter value when testing a faster cadence.

The service accepts `DATABASE_URL`, or the same `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` environment variables used by the Node.js backend (the local `server/.env` is loaded for development). Apply `server/database/005_ai_predictions.sql` before starting scheduled scoring.
