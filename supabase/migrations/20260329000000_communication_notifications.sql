-- COMP-028.3: Communication — notifications table for NotificationEventConsumer.

CREATE SCHEMA IF NOT EXISTS communication;

CREATE TABLE IF NOT EXISTS communication.notifications (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  source_event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_communication_notifications_user_id ON communication.notifications (user_id);
CREATE INDEX idx_communication_notifications_user_id_created_at ON communication.notifications (user_id, created_at DESC);

COMMENT ON TABLE communication.notifications IS 'Notifications created from domain events (COMP-028.3).';
