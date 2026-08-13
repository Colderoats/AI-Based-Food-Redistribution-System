"""Train the Part 3 XGBoost waste-risk classifier.

Run from the repository root:
    python ai-service/risk_scoring/train_risk_scoring.py
"""

from __future__ import annotations

import json
import pickle
import random
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import precision_recall_fscore_support
from torch import nn
from xgboost import XGBClassifier


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "ai-service" / "data" / "processed"
FORECAST_DIR = ROOT / "ai-service" / "models" / "forecasting"
MODEL_DIR = ROOT / "ai-service" / "models" / "risk_scoring"
REPORT_DIR = ROOT / "ai-service" / "reports"
LOOKBACK_DAYS = 14
FEATURE_COLUMNS = [
    "days_to_expiry", "current_stock", "demand_forecast", "historical_waste_rate",
    "order_count", "unique_products", "month", "is_weekend", "category_code",
]


class DemandLSTM(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.lstm = nn.LSTM(input_size=1, hidden_size=16, num_layers=1, batch_first=True)
        self.output = nn.Linear(16, 1)

    def forward(self, values: torch.Tensor) -> torch.Tensor:
        sequence, _ = self.lstm(values)
        return self.output(sequence[:, -1, :])


def set_seed() -> None:
    random.seed(42)
    np.random.seed(42)
    torch.manual_seed(42)


def load_frame(split: str) -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / f"{split}.csv", parse_dates=["date"]).sort_values(["food_category", "date"])


def forecast_features(frame: pd.DataFrame) -> pd.Series:
    """Blend the saved Prophet and LSTM models without retraining either model."""
    result = pd.Series(index=frame.index, dtype=float)
    for category, group in frame.groupby("food_category", sort=False):
        slug = category.lower().replace(" ", "-")
        with (FORECAST_DIR / f"prophet_{slug}_v1.pkl").open("rb") as source:
            prophet = pickle.load(source)
        prophet_values = np.clip(prophet.predict(group[["date"]].rename(columns={"date": "ds"}))["yhat"].to_numpy(), 0, None)
        checkpoint = torch.load(FORECAST_DIR / f"lstm_{slug}_v1.pt", weights_only=False)
        lstm = DemandLSTM()
        lstm.load_state_dict(checkpoint["model_state_dict"])
        lstm.eval()
        scaler = checkpoint["scaler"]
        history = group["units_sold"].to_numpy(dtype=float)
        lstm_values = []
        for position in range(len(group)):
            if position < LOOKBACK_DAYS:
                lstm_values.append(np.nan)
                continue
            window = scaler.transform(history[position - LOOKBACK_DAYS:position].reshape(-1, 1))
            with torch.no_grad():
                scaled_prediction = lstm(torch.tensor(window[None, ...], dtype=torch.float32)).item()
            lstm_values.append(float(scaler.inverse_transform([[scaled_prediction]])[0, 0]))
        blended = np.where(np.isnan(lstm_values), prophet_values, (prophet_values + np.clip(lstm_values, 0, None)) / 2)
        result.loc[group.index] = blended
    return result


def prepare_features(frame: pd.DataFrame, category_codes: dict[str, int]) -> pd.DataFrame:
    prepared = frame.copy().reset_index(drop=True)
    prepared["demand_forecast"] = forecast_features(prepared)
    prepared["days_to_expiry"] = prepared["avg_days_to_expiry_simulated"].clip(lower=0)
    prepared["current_stock"] = prepared["estimated_current_stock_simulated"].clip(lower=0)
    # Historical damage is context rather than a contemporaneous waste label.
    prepared["historical_waste_rate"] = np.log1p(prepared["historical_damaged_stock_total"]) / np.log1p(
        prepared["historical_damaged_stock_total"].max()
    )
    prepared["category_code"] = prepared["food_category"].map(category_codes)
    stock_coverage = prepared["current_stock"] / prepared["demand_forecast"].clip(lower=1)
    expiry_pressure = 1 / prepared["days_to_expiry"].clip(lower=1)
    # No observed dated waste label exists. These operational tiers are derived
    # from expiry, surplus coverage, and historic damage context for training.
    proxy_risk = 0.55 * np.clip(stock_coverage / 4, 0, 1) + 0.35 * np.clip(expiry_pressure * 7, 0, 1) + 0.10 * prepared["historical_waste_rate"]
    prepared["proxy_risk"] = proxy_risk
    return prepared


def main() -> None:
    set_seed()
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    train, validation, test = (load_frame(name) for name in ("train", "validation", "test"))
    categories = sorted(pd.concat([train, validation, test])["food_category"].unique())
    category_codes = {category: index for index, category in enumerate(categories)}
    train_prepared = prepare_features(pd.concat([train, validation]), category_codes)
    test_prepared = prepare_features(test, category_codes)
    low_cut, high_cut = train_prepared["proxy_risk"].quantile([0.33, 0.66]).tolist()
    for prepared in (train_prepared, test_prepared):
        prepared["risk_tier"] = pd.cut(
            prepared["proxy_risk"], [-np.inf, low_cut, high_cut, np.inf], labels=[0, 1, 2], include_lowest=True
        ).astype(int)
    model = XGBClassifier(
        objective="multi:softprob", num_class=3, n_estimators=250, max_depth=4,
        learning_rate=0.05, subsample=0.9, colsample_bytree=0.9, random_state=42,
        eval_metric="mlogloss",
    )
    model.fit(train_prepared[FEATURE_COLUMNS], train_prepared["risk_tier"])
    predicted = model.predict(test_prepared[FEATURE_COLUMNS])
    precision, recall, f1, _ = precision_recall_fscore_support(
        test_prepared["risk_tier"], predicted, labels=[0, 1, 2], average="macro", zero_division=0
    )
    importances = dict(sorted(zip(FEATURE_COLUMNS, model.feature_importances_.tolist()), key=lambda pair: pair[1], reverse=True))
    model.save_model(MODEL_DIR / "risk_scoring_xgboost_v1.json")
    metadata = {"feature_columns": FEATURE_COLUMNS, "category_codes": category_codes, "risk_tiers": {"0": "low", "1": "medium", "2": "high"}, "risk_tier_thresholds": {"low_to_medium": low_cut, "medium_to_high": high_cut}, "historical_damage_max": float(train_prepared["historical_damaged_stock_total"].max())}
    (MODEL_DIR / "risk_scoring_metadata_v1.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    report = {"model": "XGBoost classifier", "evaluation_split": "chronological test", "macro_precision": float(precision), "macro_recall": float(recall), "macro_f1": float(f1), "feature_importances": importances}
    (REPORT_DIR / "risk_scoring_evaluation_v1.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
