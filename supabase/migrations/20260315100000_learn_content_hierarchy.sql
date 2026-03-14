-- COMP-015.5: Learn Content Hierarchy — careers, tracks, courses.

CREATE SCHEMA IF NOT EXISTS learn;

CREATE TABLE IF NOT EXISTS learn.careers (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  track_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_careers_id ON learn.careers (id);

CREATE TABLE IF NOT EXISTS learn.tracks (
  id UUID PRIMARY KEY,
  career_id UUID NOT NULL REFERENCES learn.careers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  course_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tracks_career_id ON learn.tracks (career_id);

CREATE TABLE IF NOT EXISTS learn.courses (
  id UUID PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES learn.tracks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_position INTEGER NOT NULL,
  fragment_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_track_id ON learn.courses (track_id);

COMMENT ON TABLE learn.careers IS 'Learn content hierarchy — Career aggregates (COMP-015.5).';
COMMENT ON TABLE learn.tracks IS 'Learn content hierarchy — Track entities (COMP-015.5).';
COMMENT ON TABLE learn.courses IS 'Learn content hierarchy — Course entities (COMP-015.5).';
