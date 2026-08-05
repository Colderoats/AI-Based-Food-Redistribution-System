CREATE TABLE IF NOT EXISTS tenant (
  tenant_id BIGSERIAL PRIMARY KEY,
  tenant_name VARCHAR(150) NOT NULL,
  tenant_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support databases created by the earlier tenant schema, which did not yet
-- include a stable code or account status.
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS tenant_code VARCHAR(50);
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
UPDATE tenant SET tenant_code = CONCAT('legacy-', tenant_id) WHERE tenant_code IS NULL;
ALTER TABLE tenant ALTER COLUMN tenant_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS tenant_tenant_code_idx ON tenant (tenant_code);

ALTER TABLE FOOD_BUSINESS ADD COLUMN IF NOT EXISTS tenant_id BIGINT REFERENCES tenant(tenant_id);
ALTER TABLE NGO ADD COLUMN IF NOT EXISTS tenant_id BIGINT REFERENCES tenant(tenant_id);

ALTER TABLE PRODUCT ADD COLUMN IF NOT EXISTS barcode VARCHAR(128);
ALTER TABLE PRODUCT ADD COLUMN IF NOT EXISTS storage_requirements VARCHAR(80) DEFAULT 'cool-dry';
ALTER TABLE PRODUCT ADD COLUMN IF NOT EXISTS perishability_risk VARCHAR(30) DEFAULT 'medium';
ALTER TABLE PRODUCT ADD COLUMN IF NOT EXISTS taxonomy_group VARCHAR(50) DEFAULT 'general';

ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS barcode VARCHAR(128);
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS inventory_status VARCHAR(30) DEFAULT 'available';
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS days_to_expiry INTEGER DEFAULT 7;
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMPTZ;
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS pos_external_id VARCHAR(100);
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS unit VARCHAR(30) DEFAULT 'units';
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS supplier VARCHAR(150);
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100);
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS storage_type VARCHAR(80) DEFAULT 'cool-dry';
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS purchase_cost NUMERIC(12,2);
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS selling_price NUMERIC(12,2);
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS alert_days INTEGER NOT NULL DEFAULT 7 CHECK (alert_days >= 0);
ALTER TABLE INVENTORY ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS inventory_expiry_date_idx ON INVENTORY(expiry_date);
CREATE INDEX IF NOT EXISTS product_business_category_idx ON PRODUCT(business_id, category);
CREATE INDEX IF NOT EXISTS product_business_barcode_idx ON PRODUCT(business_id, barcode);
CREATE UNIQUE INDEX IF NOT EXISTS product_business_sku_unique_idx ON PRODUCT(business_id, sku) WHERE sku IS NOT NULL;

CREATE TABLE IF NOT EXISTS notification_log (
  notification_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('business', 'ngo', 'admin')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(40) DEFAULT 'system',
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_transaction (
  transaction_id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenant(tenant_id),
  business_id BIGINT REFERENCES FOOD_BUSINESS(business_id),
  inventory_id BIGINT REFERENCES INVENTORY(inventory_id),
  transaction_type VARCHAR(40) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'donation', 'adjustment', 'scan')),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS surplus_donation_log (
  log_id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT REFERENCES tenant(tenant_id),
  business_id BIGINT REFERENCES FOOD_BUSINESS(business_id),
  ngo_id BIGINT REFERENCES NGO(ngo_id),
  surplus_id BIGINT REFERENCES surplus_food(surplus_id),
  action VARCHAR(40) NOT NULL CHECK (action IN ('listed', 'requested', 'approved', 'picked_up', 'cancelled')),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tenant (tenant_name, tenant_code, status)
VALUES ('FoodLoop Demo Tenant', 'foodloop-demo', 'active')
ON CONFLICT (tenant_code) DO NOTHING;

-- PostgreSQL defaults cannot contain a SELECT. Backfill legacy records; new
-- accounts continue to be isolated by their owning business/NGO identifiers.
UPDATE FOOD_BUSINESS
SET tenant_id = (SELECT tenant_id FROM tenant WHERE tenant_code = 'foodloop-demo')
WHERE tenant_id IS NULL;
UPDATE NGO
SET tenant_id = (SELECT tenant_id FROM tenant WHERE tenant_code = 'foodloop-demo')
WHERE tenant_id IS NULL;
