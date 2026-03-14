-- COMP-030.7: IDE Domain — ide_sessions, workspace_snapshots.
-- Schema: ide (ADR-004 one schema per domain).

CREATE SCHEMA IF NOT EXISTS ide;

CREATE TABLE ide.ide_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'provisioning', 'active', 'suspended', 'terminated')),
  container_id TEXT,
  workspace_id TEXT,
  started_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ide_sessions_user_id ON ide.ide_sessions (user_id);
CREATE INDEX idx_ide_sessions_status ON ide.ide_sessions (status);
CREATE INDEX idx_ide_sessions_created_at ON ide.ide_sessions (created_at);

CREATE TABLE ide.workspace_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id TEXT NOT NULL UNIQUE,
  session_id TEXT NOT NULL REFERENCES ide.ide_sessions(session_id) ON DELETE CASCADE,
  version INT NOT NULL CHECK (version >= 1),
  files JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ide_workspace_snapshots_session_id ON ide.workspace_snapshots (session_id);
CREATE INDEX idx_ide_workspace_snapshots_created_at ON ide.workspace_snapshots (created_at);

COMMENT ON TABLE ide.ide_sessions IS 'IDESession aggregate — lifecycle and container binding (COMP-030.1, COMP-030.7).';
COMMENT ON TABLE ide.workspace_snapshots IS 'WorkspaceSnapshot — file system state per session (COMP-030.4, COMP-030.7).';
