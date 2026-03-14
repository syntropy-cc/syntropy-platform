/**
 * DOIProvider port — abstraction for DOI registration (COMP-026.2).
 * Implemented by DataCiteAdapter (ACL); domain does not depend on DataCite vocabulary.
 */

/**
 * Minimal article metadata required to register a DOI.
 * DataCite-specific fields are mapped inside the adapter.
 */
export interface ArticleDOIMetadata {
  title: string;
  authors: string[];
  year: number;
  /** Optional URL where the article is published (e.g. Labs article page). */
  url?: string;
}

export interface RegisterDOIResult {
  doi: string;
}

/**
 * Port for minting and managing DOIs via an external provider (e.g. DataCite).
 */
export interface DOIProvider {
  /**
   * Register a new DOI for the given article metadata.
   * @returns The minted DOI string.
   */
  register(article: ArticleDOIMetadata): Promise<RegisterDOIResult>;

  /**
   * Mark a DOI as inactive (e.g. withdrawn or deactivated).
   */
  deactivate(doi: string): Promise<void>;
}
