-- Align the existing surplus workflow tables with the application API.

ALTER TABLE surplus_food ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE surplus_food ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ;

UPDATE surplus_food
SET status = COALESCE(status, 'Available');

ALTER TABLE ngo_request
ALTER COLUMN request_status SET DEFAULT 'Pending';

UPDATE ngo_request
SET request_status = COALESCE(request_status, 'Pending');

ALTER TABLE donation
ALTER COLUMN donation_status SET DEFAULT 'Approved';

UPDATE donation
SET donation_status = COALESCE(donation_status, 'Approved');

CREATE UNIQUE INDEX IF NOT EXISTS ngo_request_unique_pending_idx
ON ngo_request (surplus_id, ngo_id)
WHERE request_status IN ('Pending', 'Approved');