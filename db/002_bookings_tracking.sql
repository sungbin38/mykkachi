CREATE TABLE IF NOT EXISTS booking_slots (
  id text PRIMARY KEY,
  date text NOT NULL,
  hour integer NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','booked','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date,hour)
);
CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY,
  slot_id text NOT NULL,
  date text NOT NULL,
  hour integer NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  birth_date text NOT NULL,
  birth_time text,
  birth_unknown boolean NOT NULL DEFAULT false,
  calendar text NOT NULL DEFAULT 'solar' CHECK (calendar IN ('solar','lunar')),
  gender text,
  topic text NOT NULL,
  story text,
  deposit_name text,
  amount integer NOT NULL DEFAULT 100000,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','done','cancelled','expired')),
  hold_until timestamptz,
  paid_at timestamptz,
  note text,
  report_sent_at timestamptz,
  seen_at timestamptz,
  visitor_id text,
  session_id text,
  source jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date,hour);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status,created_at);
CREATE TABLE IF NOT EXISTS visitors (
  id text PRIMARY KEY,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  sessions integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  visitor_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  landing_path text,
  referrer text,
  referrer_host text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  device text,
  user_agent text,
  language text,
  screen text,
  country text,
  city text,
  page_views integer NOT NULL DEFAULT 0,
  booked_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON sessions(visitor_id);
CREATE TABLE IF NOT EXISTS track_events (
  id bigserial PRIMARY KEY,
  session_id text NOT NULL,
  visitor_id text NOT NULL,
  event text NOT NULL,
  path text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_track_events_session ON track_events(session_id,created_at);
CREATE INDEX IF NOT EXISTS idx_track_events_created ON track_events(created_at);
