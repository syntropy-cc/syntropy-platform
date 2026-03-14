/**
 * ArticleSubmissionNotifierPort — notify reviewers when article is submitted (COMP-023.6).
 * Architecture: article-editor.md; downstream (e.g. Communication) consumes to notify reviewers.
 */

import type { ArticleId } from "@syntropy/types";
import type { SubjectAreaId } from "../../scientific-context/subject-area.js";

/** Port for notifying reviewers when an article is submitted for review. */
export interface ArticleSubmissionNotifierPort {
  /**
   * Notify reviewers that an article was submitted for review.
   * Implementation may publish an event or call a notification service.
   */
  notifySubmittedForReview(
    articleId: ArticleId,
    authorId: string,
    subjectAreaId: SubjectAreaId
  ): Promise<void>;
}
