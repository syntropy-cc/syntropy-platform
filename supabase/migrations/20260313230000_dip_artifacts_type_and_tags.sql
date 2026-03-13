-- COMP-003.6: DIP Artifact Registry — add artifact_type and tags for query filtering.

ALTER TABLE dip.artifacts
  ADD COLUMN IF NOT EXISTS artifact_type TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE INDEX IF NOT EXISTS idx_artifacts_artifact_type ON dip.artifacts (artifact_type);
CREATE INDEX IF NOT EXISTS idx_artifacts_tags_gin ON dip.artifacts USING GIN (tags);

COMMENT ON COLUMN dip.artifacts.artifact_type IS 'DIP artifact type: scientific-article, dataset, experiment, code, document';
COMMENT ON COLUMN dip.artifacts.tags IS 'Optional tags for filtering published artifacts';
