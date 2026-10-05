ALTER TABLE bookings ADD COLUMN IF NOT EXISTS product text NOT NULL DEFAULT 'consultation';
ALTER TABLE bookings ALTER COLUMN slot_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN date DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN hour DROP NOT NULL;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_product_schedule_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_product_schedule_check CHECK (
  (product = 'consultation' AND slot_id IS NOT NULL AND date IS NOT NULL AND hour IS NOT NULL)
  OR (product = 'report' AND slot_id IS NULL AND date IS NULL AND hour IS NULL)
);
