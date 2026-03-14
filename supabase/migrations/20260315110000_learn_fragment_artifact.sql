-- COMP-016.5: Learn Fragment & Artifact Engine — fragments, learner_progress_records.

CREATE TABLE IF NOT EXISTS learn.fragments (
  id UUID PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES learn.courses(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published')),
  problem_content TEXT NOT NULL DEFAULT '',
  theory_content TEXT NOT NULL DEFAULT '',
  artifact_content TEXT NOT NULL DEFAULT '',
  published_artifact_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fragments_course_id ON learn.fragments (course_id);
CREATE INDEX idx_fragments_status ON learn.fragments (status);

CREATE TABLE IF NOT EXISTS learn.learner_progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('fragment', 'course', 'track')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_id, entity_type)
);

CREATE INDEX idx_learner_progress_user_entity ON learn.learner_progress_records (user_id, entity_id, entity_type);

COMMENT ON TABLE learn.fragments IS 'Learn Fragment aggregate — Problem/Theory/Artifact sections (COMP-016.5).';
COMMENT ON TABLE learn.learner_progress_records IS 'Learn progress per user per fragment/course/track (COMP-016.5).';
