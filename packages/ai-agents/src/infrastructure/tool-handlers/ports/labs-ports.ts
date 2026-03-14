/**
 * Labs domain ports for pillar tool handlers (COMP-014.3).
 * Implementations are wired by the app using Labs package services/repos.
 */

/** Article summary for search and get. */
export interface ArticleSummary {
  id: string;
  title: string;
  status?: string;
  subjectAreaId?: string;
}

/** Full article context for get_article. */
export interface ArticleContext {
  id: string;
  title: string;
  status?: string;
  content?: string;
  subjectAreaId?: string;
}

/** Experiment summary for get_experiment. */
export interface ExperimentSummary {
  id: string;
  articleId?: string;
  title?: string;
  status?: string;
}

/** Methodology suggestion for suggest_methodology. */
export interface MethodologySuggestion {
  id: string;
  name: string;
  description?: string;
  subjectAreaId?: string;
}

/**
 * Port for Labs pillar tool handlers. App provides implementation using Labs domain.
 */
export interface LabsToolPort {
  getArticle(id: string): Promise<ArticleContext | null>;
  searchArticles(query: string): Promise<ArticleSummary[]>;
  getExperiment(id: string): Promise<ExperimentSummary | null>;
  suggestMethodology(subjectArea: string): Promise<MethodologySuggestion[]>;
}
