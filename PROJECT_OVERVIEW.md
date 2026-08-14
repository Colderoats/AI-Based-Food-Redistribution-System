# AI-Based Food Redistribution System

## Overview

This full-stack, AI-powered platform reduces avoidable food waste caused by poor inventory management, inaccurate demand forecasting, and the absence of an effective redistribution system.

It is a dual-sided platform:

- **Food businesses** (such as supermarkets and food-service providers) manage inventory, receive real-time expiry alerts, view AI-generated waste-risk scores, and get reorder recommendations.
- **Recipient organizations** (NGOs and community kitchens) receive a live surplus-food feed, find suitable donations, and schedule pickups.

## Project Modules

1. **Inventory Management & Expiry Tracking System**
2. **AI-Based Waste Prediction Engine**
3. **Redistribution Marketplace & Analytics Dashboard**
4. **System Integration, Testing & Project Finalization**

## Delivery Plan

### Weeks 1–2: Inventory foundation

- Support manual, CSV, and POS-API inventory input.
- Build an expiry-tracking engine with automated threshold alerts.
- Categorize products using a food taxonomy based on perishability and storage requirements.
- Add barcode/QR scanning for mobile inventory updates.
- Create a multi-tenant database for inventory, transactions, and donation logs.

### Weeks 3–4: AI prediction and recommendations

- Collect and preprocess historical sales, purchase, and waste data into time-series datasets.
- Train demand-forecasting models using Prophet and LSTM.
- Build an XGBoost waste-risk scoring algorithm that combines days to expiry, stock level, and demand forecast.
- Create a smart reorder recommendation module.
- Deploy the AI capability as a FastAPI microservice with scheduled batch scoring and real-time scoring.

### Weeks 5–6: Redistribution experience

- Build a surplus-food listing portal with quantity, expiry, pickup location, and availability windows.
- Implement AI matching by food type, quantity, and location proximity to connect listings with NGO requirements.
- Add pickup scheduling with calendar coordination and notifications.
- Deliver React.js dashboards for businesses and NGOs.
- Provide a sustainability dashboard for waste diverted, CO2-equivalent savings, and meals redistributed.

### Weeks 7–8: Integration and finalization

- Perform end-to-end integration testing: inventory → predictor → matcher → dashboards.
- Conduct load/stress tests and cross-browser validation.
- Refine the UX and ensure responsive mobile and tablet experiences.
- Complete documentation: architecture, data-flow diagrams, API reference, model-evaluation report, deployment guide, and known limitations.
- Prepare the final presentation deck and rehearse the demonstration.

## Technology Stack and Rationale

| Technology | Decision and rationale |
| --- | --- |
| React + Node.js | A MERN-style JavaScript stack reduces context switching, has a large ecosystem, requires less boilerplate, and enables faster MVP development than Angular. |
| PostgreSQL | The domain is highly relational and benefits from foreign keys, transactions, complex joins, and strong data integrity. |
| Python FastAPI | Provides the strongest ecosystem for Pandas, NumPy, scikit-learn, and XGBoost; it is fast, generates API documentation automatically, and integrates cleanly with Node.js. |
| XGBoost | A strong, interpretable fit for structured data such as inventory levels, expiry, sales/purchase history, and demand; it generally needs less data and compute than deep learning. |
| Prophet / LSTM | Required by the original specification for demand forecasting. |
| Socket.IO | Delivers real-time surplus listings, pickup-status changes, and inventory alerts without page refreshes. |
| AWS | EC2 hosts the backend, RDS provides PostgreSQL, and S3 stores images/documents; the platform can scale beyond a prototype. |

## Core Data Model

Primary entities:

`FOOD_BUSINESS`, `PRODUCT`, `NGO`, `INVENTORY`, `SURPLUS_FOOD`, `NGO_REQUEST`, `DONATION`, `LOGISTICS`, `ANALYTICS`, and `PREDICTIONS`.

`PREDICTIONS` stores AI outputs separately from `INVENTORY`. A `USERS` authentication and role layer includes an administrator role.

Key relationships include:

`FOOD_BUSINESS → INVENTORY → SURPLUS_FOOD → DONATION → ANALYTICS`

and

`NGO → NGO_REQUEST → PICKUP / DONATION`.

## Key Design Decisions

- **PostgreSQL rather than MongoDB:** the workflow is relational—businesses, inventory, surplus, NGOs, pickups, donations, and analytics require reliable relationships and transactions.
- **External historical data:** demand and sales history is sourced through Kaggle datasets instead of inferring demand solely from inventory depletion.
- **Registration approval:** normal registrations can be approved automatically; flagged cases are routed for manual administrator review.
- **AI service boundary:** prediction and forecasting run in a Python FastAPI microservice, while the primary application remains a React + Node.js system.

## Data Sources

Kaggle datasets, accessed through the Kaggle API, provide historical sales, purchase, and waste data for training the Prophet and LSTM demand-forecasting models. Credentials are stored outside version control and are never included in this document.

## Current Status and Next Steps

_Update this section as work progresses._

- Current status: The AI-Based Waste Prediction Engine (Weeks 3-4) is complete. The chronological Blinkit-derived dataset and seven-category Prophet/LSTM forecasting artifacts are available under `ai-service/data/processed/` and `ai-service/models/forecasting/`. The XGBoost risk classifier is served by FastAPI from `ai-service/app/`, with validated real-time, batch, and reorder endpoints plus scheduled batch scoring.
- Git hygiene (2026-08-13): The four unpushed commits after `AI module part 1` were reset and recombined into a clean commit. `.gitignore` now excludes local environments and generated artifacts; the clean commit was pushed successfully to `origin/master`.
- Next milestone: Redistribution Marketplace & Analytics Dashboard (Weeks 5-6).
- Current blockers: Storage capacity is not yet represented in the data pipeline, so the reorder module takes it as a caller-supplied parameter. Batch persistence is intentionally a local JSON outbox stub until the Node.js/PostgreSQL integration phase.
- Planned next actions: build surplus listings, AI-supported NGO matching, pickup scheduling, and the business/NGO sustainability dashboards.

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
