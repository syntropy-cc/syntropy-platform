/**
 * Learn domain ports for pillar tool handlers (COMP-014.1).
 * Implementations are wired by the app using Learn package services/repos.
 */

/** Summary of a fragment for search results. */
export interface FragmentSummary {
  id: string;
  title: string;
  courseId?: string;
  status?: string;
}

/** Full fragment context for get_fragment. */
export interface FragmentContext {
  id: string;
  title: string;
  courseId?: string;
  status?: string;
  problemContent?: string;
  theoryContent?: string;
  artifactContent?: string;
}

/** Learner progress summary for get_learner_progress. */
export interface LearnerProgressSummary {
  userId: string;
  completedEntityIds: string[];
  inProgressEntityIds: string[];
}

/** Suggested next content item for suggest_next_content. */
export interface SuggestedContent {
  entityId: string;
  entityType: string;
  title?: string;
  reason?: string;
}

/**
 * Port for Learn pillar tool handlers. App provides implementation using Learn domain.
 */
export interface LearnToolPort {
  searchFragments(query: string): Promise<FragmentSummary[]>;
  getFragment(id: string): Promise<FragmentContext | null>;
  getLearnerProgress(userId: string): Promise<LearnerProgressSummary>;
  suggestNextContent(userId: string): Promise<SuggestedContent[]>;
}
