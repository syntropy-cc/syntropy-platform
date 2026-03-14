-- COMP-016.6: Fragment review log — audit trail for approve/reject and rejection reason.

CREATE TABLE IF NOT EXISTS learn.fragment_review_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fragment_id UUID NOT NULL REFERENCES learn.fragments(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fragment_review_log_fragment_id ON learn.fragment_review_log (fragment_id);

COMMENT ON TABLE learn.fragment_review_log IS 'Audit log for fragment review decisions (COMP-016.6).';
