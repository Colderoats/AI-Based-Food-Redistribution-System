# AI service data pipeline

This folder currently contains Part 1 data preparation only; it does not start a FastAPI service or train models.

Run `python ai-service/data/build_pipeline.py` from the repository root after placing the Blinkit source files under `ai-service/data/raw/blinkit-sales-dataset/`. Processed chronological datasets are written under `ai-service/data/processed/`.
