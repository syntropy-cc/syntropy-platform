-- COMP-025.5: Labs Open Peer Review — reviews, review_passage_links, author_responses.
-- Schema: labs (existing).

CREATE TABLE labs.reviews (
  id UUID PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES labs.scientific_articles(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'submitted', 'published', 'embargoed')),
  content TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labs_reviews_article_id_status ON labs.reviews (article_id, status);
CREATE INDEX idx_labs_reviews_reviewer_id ON labs.reviews (reviewer_id);

CREATE TABLE labs.review_passage_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES labs.reviews(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES labs.scientific_articles(id) ON DELETE CASCADE,
  start_offset INTEGER NOT NULL CHECK (start_offset >= 0),
  end_offset INTEGER NOT NULL CHECK (end_offset >= 0),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_passage_offsets CHECK (start_offset <= end_offset)
);

CREATE INDEX idx_labs_review_passage_links_review_id ON labs.review_passage_links (review_id);

CREATE TABLE labs.author_responses (
  id UUID PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES labs.reviews(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES labs.scientific_articles(id) ON DELETE CASCADE,
  review_passage_link_id UUID REFERENCES labs.review_passage_links(id) ON DELETE SET NULL,
  responder_id TEXT NOT NULL,
  response_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labs_author_responses_review_id ON labs.author_responses (review_id);

COMMENT ON TABLE labs.reviews IS 'Labs Open Peer Review — peer reviews (COMP-025.5).';
COMMENT ON TABLE labs.review_passage_links IS 'Labs Open Peer Review — passage-level comments (COMP-025.5).';
COMMENT ON TABLE labs.author_responses IS 'Labs Open Peer Review — author replies to reviews (COMP-025.5).';
