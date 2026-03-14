/**
 * Embedding port for semantic search (COMP-011.4).
 * Architecture: Platform Core — Search & Recommendation, PAT-005 (adapter at boundary).
 * Implementations call external embedding API (e.g. OpenAI text-embedding-3-small).
 */

/**
 * Port for generating text embeddings. Dimension 1536 for OpenAI text-embedding-3-small.
 */
export interface EmbeddingPort {
  /**
   * Embed a single text into a 1536-dimensional vector.
   * @param text - Input text to embed
   * @returns Promise resolving to embedding vector
   */
  embed(text: string): Promise<number[]>;
}
