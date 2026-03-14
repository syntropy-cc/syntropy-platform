-- COMP-011.4: Search & Recommendation — add pgvector embedding column for semantic search.
-- Requires pgvector extension (enabled in docker/postgres/init.d/01-pgvector.sql).

ALTER TABLE platform_core.search_index
  ADD COLUMN IF NOT EXISTS embedding vector(1536) NULL;

-- HNSW supports empty table; IVFFlat requires rows >= lists.
CREATE INDEX IF NOT EXISTS idx_search_index_embedding
  ON platform_core.search_index
  USING hnsw (embedding vector_cosine_ops);

COMMENT ON COLUMN platform_core.search_index.embedding IS 'OpenAI text-embedding-3-small vector (1536 dims) for semantic search (COMP-011.4).';
