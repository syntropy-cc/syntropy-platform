-- COMP-029.5: Planning — tasks, goals, sprints, study_plans, mentor_sessions.
-- Schema: planning (COMP-039.4 audit columns).

CREATE SCHEMA IF NOT EXISTS planning;

CREATE TABLE planning.tasks (
  task_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planning_tasks_user_id ON planning.tasks (user_id);
CREATE INDEX idx_planning_tasks_status ON planning.tasks (status);

CREATE TABLE planning.goals (
  goal_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date TIMESTAMPTZ NOT NULL,
  target_value NUMERIC(12, 2) NOT NULL CHECK (target_value >= 0),
  current_value NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_value >= 0),
  status TEXT NOT NULL CHECK (status IN ('active', 'achieved', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planning_goals_user_id ON planning.goals (user_id);
CREATE INDEX idx_planning_goals_status ON planning.goals (status);

CREATE TABLE planning.sprints (
  id TEXT PRIMARY KEY,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  task_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT planning_sprints_dates CHECK (start_date < end_date)
);

CREATE INDEX idx_planning_sprints_dates ON planning.sprints (start_date, end_date);

CREATE TABLE planning.study_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  career_id TEXT NOT NULL,
  suggested_path JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planning_study_plans_user_id ON planning.study_plans (user_id);
CREATE INDEX idx_planning_study_plans_career_id ON planning.study_plans (career_id);

CREATE TABLE planning.mentor_sessions (
  session_id TEXT PRIMARY KEY,
  mentor_id TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_planning_mentor_sessions_mentor_id ON planning.mentor_sessions (mentor_id);
CREATE INDEX idx_planning_mentor_sessions_learner_id ON planning.mentor_sessions (learner_id);
CREATE INDEX idx_planning_mentor_sessions_scheduled_at ON planning.mentor_sessions (scheduled_at);

COMMENT ON TABLE planning.tasks IS 'Task aggregate — atomic unit of work (COMP-029.1).';
COMMENT ON TABLE planning.goals IS 'Goal entity — outcome-focused objective (COMP-029.2).';
COMMENT ON TABLE planning.sprints IS 'Sprint entity — time-bounded iteration (COMP-029.2).';
COMMENT ON TABLE planning.study_plans IS 'StudyPlan aggregate — suggested learning path (COMP-029.3).';
COMMENT ON TABLE planning.mentor_sessions IS 'MentorSession entity — scheduled mentor–learner interaction (COMP-029.4).';
