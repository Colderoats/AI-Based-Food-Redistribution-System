CREATE TABLE IF NOT EXISTS predictions (
  prediction_id BIGSERIAL PRIMARY KEY,
  inventory_id BIGINT NOT NULL REFERENCES inventory(inventory_id) ON DELETE CASCADE,
  business_id BIGINT NOT NULL REFERENCES food_business(business_id) ON DELETE CASCADE,
  risk_score NUMERIC(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_tier VARCHAR(10) NOT NULL CHECK (risk_tier IN ('low', 'medium', 'high')),
  risk_probabilities JSONB NOT NULL,
  reorder_recommendation JSONB NOT NULL,
  model_version VARCHAR(100) NOT NULL,
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS predictions_inventory_predicted_at_idx
  ON predictions (inventory_id, predicted_at DESC);
CREATE INDEX IF NOT EXISTS predictions_business_risk_idx
  ON predictions (business_id, risk_tier, predicted_at DESC);
