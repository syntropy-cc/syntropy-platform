-- COMP-012.7: AI Agents — agent_sessions table.
-- Stores AgentSession aggregate: session_id, user_id, agent_id, status, history (JSONB), started_at, ended_at.

CREATE SCHEMA IF NOT EXISTS ai_agents;

CREATE TABLE ai_agents.agent_sessions (
  session_id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL,
  history JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_agent_sessions_user_id ON ai_agents.agent_sessions (user_id);
CREATE INDEX idx_agent_sessions_user_status ON ai_agents.agent_sessions (user_id, status);

COMMENT ON TABLE ai_agents.agent_sessions IS 'AI agent sessions — session aggregate (COMP-012.7).';
