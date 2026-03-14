-- COMP-028.5: Communication — notification_preferences table for user notification preferences.

CREATE TABLE IF NOT EXISTS communication.notification_preferences (
  user_id TEXT PRIMARY KEY,
  mute_until TIMESTAMPTZ NULL,
  channel_preferences JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE communication.notification_preferences IS 'Per-user notification preferences: snooze (mute_until) and per-type channel toggles (COMP-028.5).';
