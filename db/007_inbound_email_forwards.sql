-- Only delivery IDs are stored. Email bodies and attachments remain in Resend/Gmail.
CREATE TABLE IF NOT EXISTS inbound_email_forwards (
  received_email_id text PRIMARY KEY,
  sent_email_id text NOT NULL,
  forwarded_at timestamptz NOT NULL DEFAULT now()
);
