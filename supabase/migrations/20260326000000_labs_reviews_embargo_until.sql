-- COMP-025.6: Add embargo_until to labs.reviews for scheduled publication.
ALTER TABLE labs.reviews
  ADD COLUMN IF NOT EXISTS embargo_until TIMESTAMPTZ;

COMMENT ON COLUMN labs.reviews.embargo_until IS 'When embargo expires; reviews with status=embargoed and embargo_until <= now() are published by the scheduler.';
