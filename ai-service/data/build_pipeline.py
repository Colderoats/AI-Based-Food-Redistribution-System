"""Build chronological food-category datasets from the Blinkit Kaggle source.

Run from the repository root:
    python ai-service/data/build_pipeline.py

The source has dated sales and product shelf-life fields, but does not identify
the inventory batch sold with an order.  The two batch-state features therefore
remain deliberately labelled as deterministic simulations/proxies.
"""

from __future__ import annotations

import csv
import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "ai-service" / "data" / "raw" / "blinkit-sales-dataset"
PROCESSED = ROOT / "ai-service" / "data" / "processed"
CATEGORY_DIR = PROCESSED / "by_category"

SOURCE_URL = "https://www.kaggle.com/datasets/akxiit/blinkit-sales-dataset"

# Matches the taxonomy already used by server/utils/inventoryEngine.js.
CATEGORY_MAP = {
    "Fruits & Vegetables": "Fruits",
    "Dairy & Breakfast": "Dairy",
    "Munchies": "Snacks",
    "Cold Drinks & Juices": "Beverages",
    "Instant & Frozen Food": "Frozen Foods",
    "Bakery & Biscuits": "Bakery",
    "Sweet Tooth": "Snacks",
    "Atta, Rice & Dal": "Grains",
    "Grocery & Staples": "Dry Goods",
    "Masala, Oil & More": "Condiments",
    "Snacks & Munchies": "Snacks",
}


def read_csv(name: str):
    with (RAW / name).open(encoding="utf-8-sig", newline="") as source:
        yield from csv.DictReader(source)


def safe_int(value: str | None, default: int = 0) -> int:
    try:
        return int(float(value or default))
    except (TypeError, ValueError):
        return default


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


def split_dates(rows: list[dict]) -> dict[str, list[dict]]:
    dates = sorted({row["date"] for row in rows})
    # Keep at least one distinct date in every split where the data permits.
    train_end = max(1, int(len(dates) * 0.70))
    validation_end = max(train_end + 1, int(len(dates) * 0.85))
    validation_end = min(validation_end, len(dates) - 1)
    train_dates, validation_dates = set(dates[:train_end]), set(dates[train_end:validation_end])
    return {
        "train": [row for row in rows if row["date"] in train_dates],
        "validation": [row for row in rows if row["date"] in validation_dates],
        "test": [row for row in rows if row["date"] not in train_dates | validation_dates],
    }


def main() -> None:
    products: dict[str, dict] = {}
    unmapped_categories: set[str] = set()
    for row in read_csv("blinkit_products.csv"):
        raw_category = row["category"].strip()
        category = CATEGORY_MAP.get(raw_category, "Other")
        if category == "Other":
            unmapped_categories.add(raw_category)
        products[row["product_id"]] = {
            "food_category": category,
            "shelf_life_days": max(1, safe_int(row["shelf_life_days"], 7)),
            "min_stock_level": safe_int(row["min_stock_level"]),
            "max_stock_level": max(1, safe_int(row["max_stock_level"], 1)),
        }

    order_dates: dict[str, datetime] = {}
    for row in read_csv("blinkit_orders.csv"):
        try:
            order_dates[row["order_id"]] = datetime.strptime(row["order_date"], "%Y-%m-%d %H:%M:%S")
        except (ValueError, KeyError):
            continue

    # The raw inventory dates predate the dated order history.  Aggregate their
    # damage value as provenance only; do not falsely join it to 2024 sales days.
    historical_damage = defaultdict(int)
    for row in read_csv("blinkit_inventory.csv"):
        historical_damage[row["product_id"]] += safe_int(row["damaged_stock"])

    daily = defaultdict(lambda: {"units_sold": 0, "order_ids": set(), "products": set(),
                                 "stock_by_product": {}, "expiry_total": 0,
                                 "damage_by_product": {}})
    skipped_items = 0
    for row in read_csv("blinkit_order_items.csv"):
        product = products.get(row["product_id"])
        ordered_at = order_dates.get(row["order_id"])
        if not product or not ordered_at:
            skipped_items += 1
            continue
        quantity = safe_int(row["quantity"])
        day = ordered_at.date()
        date_key = day.isoformat()
        key = (date_key, product["food_category"])
        bucket = daily[key]
        bucket["units_sold"] += quantity
        bucket["order_ids"].add(row["order_id"])
        bucket["products"].add(row["product_id"])

        # Simulated batch age/current balance.  It uses real shelf-life and
        # min/max thresholds but is not a claimed observed inventory count.
        cycle_day = (day.toordinal() + safe_int(row["product_id"])) % product["shelf_life_days"]
        days_to_expiry = product["shelf_life_days"] - cycle_day
        stock_range = max(1, product["max_stock_level"] - product["min_stock_level"])
        estimated_stock = product["min_stock_level"] + ((day.toordinal() + safe_int(row["product_id"])) % (stock_range + 1))
        bucket["expiry_total"] += days_to_expiry * quantity
        bucket["stock_by_product"][row["product_id"]] = estimated_stock
        bucket["damage_by_product"][row["product_id"]] = historical_damage[row["product_id"]]

    columns = [
        "date", "food_category", "units_sold", "order_count", "unique_products",
        "estimated_current_stock_simulated", "avg_days_to_expiry_simulated",
        "historical_damaged_stock_total", "day_of_week", "month", "is_weekend",
    ]
    rows: list[dict] = []
    for (date_key, category), values in sorted(daily.items()):
        current = datetime.strptime(date_key, "%Y-%m-%d")
        rows.append({
            "date": date_key,
            "food_category": category,
            "units_sold": values["units_sold"],
            "order_count": len(values["order_ids"]),
            "unique_products": len(values["products"]),
            "estimated_current_stock_simulated": round(sum(values["stock_by_product"].values()), 2),
            "avg_days_to_expiry_simulated": round(values["expiry_total"] / max(1, values["units_sold"]), 2),
            "historical_damaged_stock_total": sum(values["damage_by_product"].values()),
            "day_of_week": current.strftime("%A"),
            "month": current.month,
            "is_weekend": int(current.weekday() >= 5),
        })

    splits = split_dates(rows)
    for name, split_rows in splits.items():
        write_csv(PROCESSED / f"{name}.csv", split_rows, columns)
        for category in sorted({row["food_category"] for row in split_rows}):
            write_csv(CATEGORY_DIR / f"{slug(category)}_{name}.csv",
                      [row for row in split_rows if row["food_category"] == category], columns)

    write_csv(PROCESSED / "all_category_daily.csv", rows, columns)
    summary = f"""# Data Summary

## Source

- **Dataset:** Blinkit Sales Dataset
- **Kaggle:** {SOURCE_URL}
- **License:** MIT
- **Raw files used:** `blinkit_orders.csv`, `blinkit_order_items.csv`, `blinkit_products.csv`, and `blinkit_inventory.csv`.

## Coverage and quality

- Order-item rows processed: {sum(row['units_sold'] for row in rows):,} units across {len(rows):,} daily category observations.
- Date range: {rows[0]['date']} through {rows[-1]['date']}.
- Food taxonomy categories: {", ".join(sorted({row['food_category'] for row in rows}))}.
- Raw product categories mapped to `Other`: {", ".join(sorted(unmapped_categories)) or "None"}.
- Skipped order-item records with a missing product or usable order timestamp: {skipped_items:,}.
- Missing values in final training columns: none. Invalid/missing timestamps are excluded rather than imputed.

## Derived fields and limitations

- `estimated_current_stock_simulated` is a deterministic proxy based on each product's real `min_stock_level`/`max_stock_level`; dated sales and inventory history do not overlap, so it is not an observed stock balance.
- `avg_days_to_expiry_simulated` uses the real product `shelf_life_days` and a deterministic batch-age cycle because order items do not identify the batch sold.
- `historical_damaged_stock_total` is the all-time raw inventory damage total for products sold in the category/day. It is retained as historical context, not presented as damage occurring on that sales date.
- No holiday calendar was added: the source has no location/calendar metadata. Day of week, month, and weekend indicators are included.

## Chronological splits

| Split | Rows | Dates |
| --- | ---: | ---: |
""" + "\n".join(
        f"| {name.title()} | {len(split_rows):,} | {min(row['date'] for row in split_rows)} to {max(row['date'] for row in split_rows)} |"
        for name, split_rows in splits.items()
    ) + "\n"
    (ROOT / "ai-service" / "data" / "DATA_SUMMARY.md").write_text(summary, encoding="utf-8")

    print(f"Wrote {len(rows):,} observations to {PROCESSED}")
    for name, split_rows in splits.items():
        print(f"{name}: {len(split_rows):,} rows; {len({row['food_category'] for row in split_rows})} categories")


if __name__ == "__main__":
    main()
