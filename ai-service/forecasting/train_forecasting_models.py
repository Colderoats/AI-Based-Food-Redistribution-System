"""Train Prophet and LSTM demand models from the Part 1 chronological splits.

Run from the repository root:
    python ai-service/forecasting/train_forecasting_models.py
"""

from __future__ import annotations

import json
import pickle
import random
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.preprocessing import MinMaxScaler
from torch import nn


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "ai-service" / "data" / "processed" / "by_category"
MODEL_DIR = ROOT / "ai-service" / "models" / "forecasting"
REPORT_DIR = ROOT / "ai-service" / "reports"
LOOKBACK_DAYS = 14
MAX_EPOCHS = 100
EARLY_STOPPING_PATIENCE = 12
RISK_STOCK_MULTIPLIER = 1.25


class DemandLSTM(nn.Module):
    """Small single-feature sequence model, deliberately limited for this dataset."""

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


def metric_values(actual: np.ndarray, predicted: np.ndarray) -> dict[str, float]:
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    nonzero = actual != 0
    return {
        "mae": float(mean_absolute_error(actual, predicted)),
        "rmse": float(mean_squared_error(actual, predicted) ** 0.5),
        "mape": float(np.mean(np.abs((actual[nonzero] - predicted[nonzero]) / actual[nonzero])) * 100)
        if nonzero.any()
        else 0.0,
    }


def make_sequences(values: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    features = []
    targets = []
    for index in range(LOOKBACK_DAYS, len(values)):
        features.append(values[index - LOOKBACK_DAYS : index])
        targets.append(values[index])
    return np.asarray(features, dtype=np.float32)[..., None], np.asarray(targets, dtype=np.float32)


def load_category(category_file_stem: str) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    frames = []
    for split in ("train", "validation", "test"):
        frame = pd.read_csv(DATA_DIR / f"{category_file_stem}_{split}.csv", parse_dates=["date"])
        frames.append(frame.sort_values("date").reset_index(drop=True))
    return tuple(frames)  # type: ignore[return-value]


def train_prophet(train: pd.DataFrame, validation: pd.DataFrame, test: pd.DataFrame, category: str) -> tuple[Prophet, np.ndarray]:
    model = Prophet(weekly_seasonality=True, yearly_seasonality=False, daily_seasonality=False)
    model.fit(pd.concat([train, validation], ignore_index=True)[["date", "units_sold"]].rename(columns={"date": "ds", "units_sold": "y"}))
    forecast = model.predict(test[["date"]].rename(columns={"date": "ds"}))
    with (MODEL_DIR / f"prophet_{category}_v1.pkl").open("wb") as artifact:
        pickle.dump(model, artifact)
    return model, np.clip(forecast["yhat"].to_numpy(), 0, None)


def train_lstm(train: pd.DataFrame, validation: pd.DataFrame, test: pd.DataFrame, category: str) -> np.ndarray:
    all_values = pd.concat([train, validation, test], ignore_index=True)["units_sold"].to_numpy(dtype=np.float32)
    train_end = len(train)
    validation_end = train_end + len(validation)
    scaler = MinMaxScaler()
    scaler.fit(all_values[:validation_end].reshape(-1, 1))
    scaled = scaler.transform(all_values.reshape(-1, 1)).flatten()
    x, y = make_sequences(scaled)
    target_positions = np.arange(LOOKBACK_DAYS, len(all_values))
    train_mask = target_positions < train_end
    validation_mask = (target_positions >= train_end) & (target_positions < validation_end)
    test_mask = target_positions >= validation_end

    model = DemandLSTM()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    loss_fn = nn.MSELoss()
    best_state = None
    best_validation_loss = float("inf")
    stale_epochs = 0
    train_x = torch.tensor(x[train_mask])
    train_y = torch.tensor(y[train_mask])
    validation_x = torch.tensor(x[validation_mask])
    validation_y = torch.tensor(y[validation_mask])
    for _ in range(MAX_EPOCHS):
        model.train()
        optimizer.zero_grad()
        loss = loss_fn(model(train_x).squeeze(1), train_y)
        loss.backward()
        optimizer.step()
        model.eval()
        with torch.no_grad():
            validation_loss = loss_fn(model(validation_x).squeeze(1), validation_y).item()
        if validation_loss < best_validation_loss - 1e-6:
            best_validation_loss = validation_loss
            best_state = {key: value.detach().clone() for key, value in model.state_dict().items()}
            stale_epochs = 0
        else:
            stale_epochs += 1
            if stale_epochs >= EARLY_STOPPING_PATIENCE:
                break
    if best_state is not None:
        model.load_state_dict(best_state)
    model.eval()
    with torch.no_grad():
        predictions = model(torch.tensor(x[test_mask])).squeeze(1).numpy()
    torch.save(
        {"model_state_dict": model.state_dict(), "scaler": scaler, "lookback_days": LOOKBACK_DAYS},
        MODEL_DIR / f"lstm_{category}_v1.pt",
    )
    return np.clip(scaler.inverse_transform(predictions.reshape(-1, 1)).flatten(), 0, None)


def main() -> None:
    set_seed()
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    risk_flags = []
    for test_path in sorted(DATA_DIR.glob("*_test.csv")):
        category = test_path.stem.removesuffix("_test")
        train, validation, test = load_category(category)
        _, prophet_predictions = train_prophet(train, validation, test, category)
        lstm_predictions = train_lstm(train, validation, test, category)
        actual = test["units_sold"].to_numpy()
        available_stock = test["estimated_current_stock_simulated"].to_numpy()
        for model_name, predictions in (("Prophet", prophet_predictions), ("LSTM", lstm_predictions)):
            metrics = metric_values(actual, predictions)
            flagged = predictions < (available_stock / RISK_STOCK_MULTIPLIER)
            results.append(
                {
                    "category": test["food_category"].iloc[0],
                    "model": model_name,
                    **metrics,
                    "high_waste_risk_days": int(flagged.sum()),
                    "test_days": len(test),
                }
            )
            for row, forecast in zip(test.loc[flagged].itertuples(index=False), predictions[flagged]):
                risk_flags.append(
                    {
                        "date": row.date.strftime("%Y-%m-%d"),
                        "category": row.food_category,
                        "model": model_name,
                        "forecast_demand": round(float(forecast), 3),
                        "available_stock": row.estimated_current_stock_simulated,
                        "threshold": round(float(row.estimated_current_stock_simulated / RISK_STOCK_MULTIPLIER), 3),
                        "flag_reason": "forecast demand is below 80% of available stock",
                    }
                )
    report = pd.DataFrame(results).sort_values(["category", "model"])
    report.to_csv(REPORT_DIR / "forecast_model_comparison_v1.csv", index=False)
    pd.DataFrame(risk_flags).to_csv(REPORT_DIR / "high_waste_risk_flags_v1.csv", index=False)
    with (REPORT_DIR / "forecast_model_comparison_v1.json").open("w", encoding="utf-8") as output:
        json.dump(report.to_dict(orient="records"), output, indent=2)
    print(report.to_string(index=False, float_format=lambda value: f"{value:.3f}"))


if __name__ == "__main__":
    main()
