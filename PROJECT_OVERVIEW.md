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

- Current status:
- Next milestone:
- Current blockers:
- Planned next actions:
