CREATE TABLE IF NOT EXISTS content (
  id text PRIMARY KEY,
  channel text NOT NULL CHECK (channel IN ('seo','threads','instagram')),
  locale text NOT NULL CHECK (locale IN ('ko','zh-TW')),
  topic text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL,
  keyword text NOT NULL,
  slides text NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','scheduled','published')),
  scheduled_at text,
  published_snapshot text,
  published_at text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  UNIQUE(locale,channel,slug)
);
CREATE INDEX IF NOT EXISTS idx_content_status_schedule ON content(status,scheduled_at);
CREATE TABLE IF NOT EXISTS event_totals (
  day text NOT NULL, event text NOT NULL, source text NOT NULL, locale text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY(day,event,source,locale)
);
CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value text NOT NULL);
CREATE TABLE IF NOT EXISTS job_runs (
  id text PRIMARY KEY, started_at text NOT NULL, summary text NOT NULL, mode text NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key text PRIMARY KEY, attempts integer NOT NULL DEFAULT 0, expires_at timestamptz NOT NULL
);
