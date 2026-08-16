# AI Module Progress

## Part 1 — Data Pipeline

- **Dataset:** [Blinkit Sales Dataset](https://www.kaggle.com/datasets/akxiit/blinkit-sales-dataset) (MIT), downloaded through the Kaggle API. Raw source is under `ai-service/data/raw/blinkit-sales-dataset/`.
- **Created:** `ai-service/data/build_pipeline.py`; raw data; `processed/all_category_daily.csv`; chronological `processed/train.csv`, `validation.csv`, and `test.csv`; and separate category/split files in `processed/by_category/`. See `ai-service/data/DATA_SUMMARY.md` for the data-quality report.
- **Preprocessing:** joins dated orders to order items and product metadata, maps source categories to the inventory module's food taxonomy, drops unusable dated order items, and adds day-of-week, month, weekend, daily category sales, and per-category product/order counts.
- **Feature caveat:** `estimated_current_stock_simulated` is a deterministic proxy derived from real min/max thresholds; `avg_days_to_expiry_simulated` is a deterministic proxy derived from real shelf life. The raw order and inventory timelines do not overlap and order items lack batch IDs. Historical damage is retained only as non-contemporaneous context.
- **Coverage:** 2,486 daily category observations from 2023-03-16 to 2024-11-04, spanning 7 food taxonomy categories. Train: 1,744 rows; validation: 375; test: 367. Splits are chronological (70% / 15% / 15% by unique dates).

## Part 2 - Forecasting Models

- **Implementation:** added `ai-service/forecasting/train_forecasting_models.py` to train Prophet and lightweight LSTM models for all seven categories. It uses the Part 1 chronological test split, a 14-day LSTM lookback, and validation-based early stopping (100-epoch cap, patience 12).
- **Artifacts:** `ai-service/models/forecasting/prophet_<category>_v1.pkl` and `lstm_<category>_v1.pt` for every category; comparison at `ai-service/reports/forecast_model_comparison_v1.csv`; first-pass flags at `ai-service/reports/high_waste_risk_flags_v1.csv`. A day is flagged when forecast demand is below 80% of its available-stock proxy.
- **Test metrics (MAE / RMSE / MAPE):** Beverages - Prophet `0.969 / 1.227 / 57.877%`, LSTM `0.998 / 1.243 / 59.695%`; Dairy - Prophet `1.513 / 2.161 / 63.392%`, LSTM `1.537 / 2.101 / 69.051%`; Dry Goods - Prophet `1.397 / 1.733 / 84.580%`, LSTM `1.293 / 1.679 / 68.285%`; Frozen Foods - Prophet `1.148 / 1.525 / 45.300%`, LSTM `1.073 / 1.439 / 46.446%`; Fruits - Prophet `1.032 / 1.252 / 69.594%`, LSTM `1.025 / 1.269 / 70.468%`; Other - Prophet `3.183 / 3.982 / 75.148%`, LSTM `3.150 / 3.941 / 73.396%`; Snacks - Prophet `1.161 / 1.512 / 52.670%`, LSTM `1.190 / 1.551 / 50.697%`.
- **Model comparison:** Prophet had lower MAE for Beverages, Dairy, and Snacks; LSTM had lower MAE for Dry Goods, Frozen Foods, Fruits, and Other. Mixed RMSE/MAPE outcomes are retained in the comparison report rather than selecting a single model globally.
- **Execution status:** complete. The environment issue was resolved through manual installation in `.venv` (Python 3.11); both models trained and evaluation/flag reports were generated.

Next: Part 3 - Waste Risk Scoring + Reorder Recommendation (XGBoost)

## Part 3 - Risk Scoring + Reorder

- **Implementation:** added `ai-service/risk_scoring/train_risk_scoring.py` and `ai-service/risk_scoring/predict.py`. Training loads and blends the saved Part 2 Prophet and LSTM forecasts as its demand-forecast feature; it does not retrain those models.
- **Model choice:** XGBoost multi-class classifier (low/medium/high) rather than a continuous regressor. The Part 1 source has no dated waste outcome, so transparent operational tiers are derived from expiry pressure, stock coverage versus forecast, and historical damage context. The tier cutoffs are learned from the chronological training distribution so all three classes are represented.
- **Evaluation:** chronological test macro precision `0.976`, recall `0.980`, and F1 `0.977`. Top feature importances: days to expiry `0.363`, unique products `0.153`, order count `0.149`, category `0.123`, and historical waste rate `0.113`. Full report: `ai-service/reports/risk_scoring_evaluation_v1.json`.
- **Artifacts:** `ai-service/models/risk_scoring/risk_scoring_xgboost_v1.json` and `risk_scoring_metadata_v1.json`.
- **Reorder logic:** `recommend_reorder` targets two forecast-demand days of safety stock, then caps the suggested purchase quantity at remaining storage capacity. `storage_capacity` is currently a caller-supplied placeholder because capacity is not yet modelled in the data pipeline.

Next: Part 4 - FastAPI Microservice + Deployment

- **Git hygiene (2026-08-13):** Reset the four unpushed commits after `AI module part 1` and recombined the legitimate changes into a clean commit. Expanded `.gitignore` to exclude `.venv`, dependencies, generated data/model artifacts, secrets, caches, IDE files, logs, and build output. The clean commit was pushed successfully to `origin/master`.

## Part 4 - FastAPI Microservice

- **Implementation:** Added `ai-service/app/` with `POST /predict/risk-score`, `POST /predict/batch`, `GET /predict/reorder-recommendation`, and `GET /health`. All inputs and outputs are validated with Pydantic, and FastAPI publishes interactive OpenAPI documentation at `/docs`.
- **Startup and scheduling:** The XGBoost model and metadata load once in the FastAPI lifespan. APScheduler scores a local active-inventory snapshot at `BATCH_PREDICTION_INTERVAL_SECONDS` (default 3,600 seconds; 60-second minimum).
- **Local run:** From the repository root run `python -m pip install -r ai-service/requirements.txt`, then `cd ai-service` and `python -m uvicorn app.main:app --reload --port 8000`.
- **Downstream contract:** Each prediction contains `inventory_id`, `business_id`, `risk_score`, `risk_tier`, `risk_probabilities`, `reorder_recommendation`, `model_version`, and UTC `predicted_at`. The complete JSON example and PostgreSQL handoff guidance are documented in `ai-service/README.md`.
- **Stub remaining:** Batch output currently appends JSON Lines to ignored `ai-service/runtime/prediction_outbox.jsonl`; scheduled scoring reads an optional `active_inventory.json` snapshot in the same directory. Replace those adapters with Node.js/PostgreSQL active-inventory reads and `PREDICTIONS` inserts during system integration.
- **Status:** AI module (Weeks 3-4 scope) is **complete**.

## Part 5 â€” Backend Integration

- **PostgreSQL persistence:** Added `server/database/005_ai_predictions.sql` and a `PREDICTIONS` repository contract for `inventory_id`, `business_id`, risk score/tier/probabilities, reorder recommendation, model version, and prediction timestamp.
- **Live integration:** Node.js calls FastAPI `POST /predict/risk-score` after inventory creation, quantity/expiry updates, and CSV imports, then persists each response. FastAPI `POST /predict/batch` and APScheduler now read/write PostgreSQL directly instead of using the JSON outbox and local snapshot.
- **Alerting:** `GET /api/expiry-alerts`, existing inventory alerts, and business notifications are driven by the latest AI `risk_tier`/`risk_score`; `alert_days` is retained as an input/context signal. Alerts include days to expiry, AI recommendation, and prediction time for the forthcoming UI.
- **Configuration and blocker update:** `BATCH_PREDICTION_INTERVAL_SECONDS` remains environment-configurable (default 3,600 seconds; 60-second minimum). The only current AI data-model limitation is the lack of explicit storage-capacity data; a conservative item-level default is used until it is modelled.
- **ID contract correction:** `/predict/batch`, scheduled scoring, and the Node FastAPI client now preserve PostgreSQL `BIGINT` `inventory_id` and `business_id` values as JSON integers through prediction persistence; identifiers remain excluded from ML features.

## Part 6 - Frontend Integration

- **Expiry alerts:** Added a separate business route at `/business/expiry-alerts` with navigation, risk-tier filtering, and sorting by AI risk score or days to expiry. The page shows the required item, days-to-expiry, configured threshold, risk tier/score, and recommended action fields.
- **Business dashboard:** Replaced the AI placeholder with current elevated-risk scores, recommended actions, and reorder quantities from the existing alert API. Existing manual, CSV, and POS inventory experiences remain unchanged.
- **Live refresh:** The alerts page and dashboard subscribe to the authenticated Socket.IO `ai:predictions-updated` event, and use a one-minute fallback refresh so immediate and scheduled Part 5 scoring results appear without a manual reload.

## Part 7 - End-to-End Integration Verification

- **Status:** Complete. An inventory create or expiry/quantity update is scored by FastAPI, persisted in `PREDICTIONS`, then immediately publishes an authenticated, business-scoped `ai:predictions-updated` event. The Expiry Alerts page and business dashboard reload the latest persisted AI alert data on that event; their one-minute refresh remains the fallback for scheduled FastAPI scoring.
- **Contract corrections:** Risk scores are displayed as their persisted 0-100 percentage values, and dashboard reorder quantities use the FastAPI `recommended_purchase_quantity` contract.
- **Swagger boundary:** FastAPI's existing local `/docs` remains unchanged for manual service testing. The browser client has no docs page, link, or FastAPI proxy; it continues to call only the Node API.
- **Scope review:** Changes are limited to AI prediction persistence/integration, its real-time notification path, the AI alert/dashboard UI, and this documentation.

Next: Weeks 5-6 redistribution marketplace, NGO matching, pickup scheduling, and sustainability dashboards.

## Reorder Recommendation Update (2026-08-16)

- Reorder target stock is now capped at storage capacity, matching the existing purchase-quantity capacity constraint.
- Inventory create/update and scheduled scoring use a conservative one-unit daily demand fallback when no retained forecast is available, so low-stock items receive a numeric reorder recommendation.
