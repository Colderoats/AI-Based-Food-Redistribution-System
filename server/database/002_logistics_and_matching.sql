-- Run this migration once against the PostgreSQL database used by the server.
-- Coordinates are optional until the application adds address geocoding.
ALTER TABLE FOOD_BUSINESS ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6);
ALTER TABLE FOOD_BUSINESS ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);
ALTER TABLE FOOD_BUSINESS ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 20;

ALTER TABLE NGO ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6);
ALTER TABLE NGO ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);
ALTER TABLE NGO ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 20;
ALTER TABLE NGO ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);

CREATE TABLE IF NOT EXISTS LOGISTICS_AVAILABILITY (
  logistics_id BIGSERIAL PRIMARY KEY,
  owner_role VARCHAR(20) NOT NULL CHECK (owner_role IN ('business', 'ngo')),
  owner_id BIGINT NOT NULL,
  vehicle_type VARCHAR(80) NOT NULL,
  capacity_kg NUMERIC(10, 2) NOT NULL CHECK (capacity_kg > 0),
  available_from TIMESTAMPTZ NOT NULL,
  available_until TIMESTAMPTZ NOT NULL,
  service_area VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(30),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Unavailable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (available_until > available_from)
);

CREATE INDEX IF NOT EXISTS logistics_availability_owner_idx
  ON LOGISTICS_AVAILABILITY (owner_role, owner_id, status);
