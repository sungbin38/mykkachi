ALTER TABLE bookings ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'ko' CHECK (locale IN ('ko', 'zh-TW'));
