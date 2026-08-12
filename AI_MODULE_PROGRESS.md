# AI Module Progress

## Part 1 — Data Pipeline

- **Dataset:** [Blinkit Sales Dataset](https://www.kaggle.com/datasets/akxiit/blinkit-sales-dataset) (MIT), downloaded through the Kaggle API. Raw source is under `ai-service/data/raw/blinkit-sales-dataset/`.
- **Created:** `ai-service/data/build_pipeline.py`; raw data; `processed/all_category_daily.csv`; chronological `processed/train.csv`, `validation.csv`, and `test.csv`; and separate category/split files in `processed/by_category/`. See `ai-service/data/DATA_SUMMARY.md` for the data-quality report.
- **Preprocessing:** joins dated orders to order items and product metadata, maps source categories to the inventory module's food taxonomy, drops unusable dated order items, and adds day-of-week, month, weekend, daily category sales, and per-category product/order counts.
- **Feature caveat:** `estimated_current_stock_simulated` is a deterministic proxy derived from real min/max thresholds; `avg_days_to_expiry_simulated` is a deterministic proxy derived from real shelf life. The raw order and inventory timelines do not overlap and order items lack batch IDs. Historical damage is retained only as non-contemporaneous context.
- **Coverage:** 2,486 daily category observations from 2023-03-16 to 2024-11-04, spanning 7 food taxonomy categories. Train: 1,744 rows; validation: 375; test: 367. Splits are chronological (70% / 15% / 15% by unique dates).

Next: Part 2 — Demand Forecasting Models (Prophet + LSTM)
