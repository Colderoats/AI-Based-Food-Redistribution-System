const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const AI_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 5000);

const daysToExpiry = (expiryDate) => Math.max(0, Math.ceil((new Date(expiryDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000));
const modelCategory = (category) => ["Beverages", "Dairy", "Dry Goods", "Frozen Foods", "Fruits", "Other", "Snacks"].includes(category) ? category : "Other";

export const toRiskScorePayload = (item, businessId) => ({
  inventory_id: Number(item.inventory_id), business_id: Number(businessId), category: modelCategory(item.category),
  days_to_expiry: daysToExpiry(item.expiry_date), current_stock: Number(item.quantity),
  demand_forecast: Number(item.demand_forecast || 0), historical_damaged_stock_total: 0,
  order_count: 0, unique_products: 1, month: new Date().getUTCMonth() + 1,
  is_weekend: [0, 6].includes(new Date().getUTCDay()), storage_capacity: Math.max(Number(item.quantity), 100),
});

const callAi = async (path, payload) => {
  const response = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`AI service returned ${response.status}: ${await response.text()}`);
  return response.json();
};

export const requestRiskScore = (item, businessId) => callAi("/predict/risk-score", toRiskScorePayload(item, businessId));
export const requestBatchPrediction = (businessId, inventory) => callAi("/predict/batch", { business_id: Number(businessId), inventory: inventory.map((item) => toRiskScorePayload(item, businessId)) });

export const persistPrediction = async (client, prediction) => {
  await client.query(`INSERT INTO predictions (inventory_id, business_id, risk_score, risk_tier, risk_probabilities, reorder_recommendation, model_version, predicted_at)
    VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8)`, [
    prediction.inventory_id, prediction.business_id, prediction.risk_score, prediction.risk_tier,
    JSON.stringify(prediction.risk_probabilities), JSON.stringify(prediction.reorder_recommendation),
    prediction.model_version, prediction.predicted_at,
  ]);
};

export const scoreAndPersistInventory = async (item, businessId, client) => {
  const prediction = await requestRiskScore(item, businessId);
  await persistPrediction(client, prediction);
  return prediction;
};
