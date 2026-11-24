ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_payment_id ON bookings(payment_id) WHERE payment_id IS NOT NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS terms_agreed_at timestamptz
