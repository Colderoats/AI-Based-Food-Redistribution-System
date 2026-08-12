# Data Summary

## Source

- **Dataset:** Blinkit Sales Dataset
- **Kaggle:** https://www.kaggle.com/datasets/akxiit/blinkit-sales-dataset
- **License:** MIT
- **Raw files used:** `blinkit_orders.csv`, `blinkit_order_items.csv`, `blinkit_products.csv`, and `blinkit_inventory.csv`.

## Coverage and quality

- Order-item rows processed: 10,034 units across 2,486 daily category observations.
- Date range: 2023-03-16 through 2024-11-04.
- Food taxonomy categories: Beverages, Dairy, Dry Goods, Frozen Foods, Fruits, Other, Snacks.
- Raw product categories mapped to `Other`: Baby Care, Household Care, Personal Care, Pet Care, Pharmacy.
- Skipped order-item records with a missing product or usable order timestamp: 0.
- Missing values in final training columns: none. Invalid/missing timestamps are excluded rather than imputed.

## Derived fields and limitations

- `estimated_current_stock_simulated` is a deterministic proxy based on each product's real `min_stock_level`/`max_stock_level`; dated sales and inventory history do not overlap, so it is not an observed stock balance.
- `avg_days_to_expiry_simulated` uses the real product `shelf_life_days` and a deterministic batch-age cycle because order items do not identify the batch sold.
- `historical_damaged_stock_total` is the all-time raw inventory damage total for products sold in the category/day. It is retained as historical context, not presented as damage occurring on that sales date.
- No holiday calendar was added: the source has no location/calendar metadata. Day of week, month, and weekend indicators are included.

## Chronological splits

| Split | Rows | Dates |
| --- | ---: | ---: |
| Train | 1,744 | 2023-03-16 to 2024-05-08 |
| Validation | 375 | 2024-05-09 to 2024-08-06 |
| Test | 367 | 2024-08-07 to 2024-11-04 |
