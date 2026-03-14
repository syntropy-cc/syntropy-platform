-- COMP-018.4: Learn Mentorship — mentorship_relationships, mentor_reviews, artifact_gallery cache.

CREATE TABLE IF NOT EXISTS learn.mentorship_relationships (
  id UUID PRIMARY KEY,
  mentor_id TEXT NOT NULL,
  learner_id TEXT NOT NULL,
  track_id UUID NOT NULL REFERENCES learn.tracks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'active', 'concluded', 'declined')),
  scope_description TEXT,
  proposed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  concluded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentorship_relationships_mentor_id ON learn.mentorship_relationships (mentor_id);
CREATE INDEX idx_mentorship_relationships_mentor_status ON learn.mentorship_relationships (mentor_id, status);
CREATE INDEX idx_mentorship_relationships_learner_id ON learn.mentorship_relationships (learner_id);

CREATE TABLE IF NOT EXISTS learn.mentor_reviews (
  id UUID PRIMARY KEY,
  relationship_id UUID NOT NULL REFERENCES learn.mentorship_relationships(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  fragment_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (relationship_id)
);

CREATE INDEX idx_mentor_reviews_relationship_id ON learn.mentor_reviews (relationship_id);

CREATE TABLE IF NOT EXISTS learn.artifact_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('user', 'track')),
  scope_id TEXT NOT NULL,
  artifact_id TEXT NOT NULL,
  title TEXT,
  creator_id TEXT,
  track_id UUID,
  artifact_type TEXT,
  published_at TIMESTAMPTZ,
  creator_xp INTEGER,
  creator_skill_level INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_artifact_gallery_scope ON learn.artifact_gallery (scope_type, scope_id);
CREATE INDEX idx_artifact_gallery_updated_at ON learn.artifact_gallery (updated_at);

COMMENT ON TABLE learn.mentorship_relationships IS 'Mentorship relationship aggregate — lifecycle proposed/active/concluded/declined (COMP-018.4).';
COMMENT ON TABLE learn.mentor_reviews IS 'Mentor review of learner fragment — one per concluded relationship (COMP-018.4).';
COMMENT ON TABLE learn.artifact_gallery IS 'Gallery read model cache — optional materialization (COMP-018.4).';
