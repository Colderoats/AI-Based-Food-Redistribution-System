ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS storage_capacity NUMERIC(12, 2)
  CHECK (storage_capacity >= 0);
