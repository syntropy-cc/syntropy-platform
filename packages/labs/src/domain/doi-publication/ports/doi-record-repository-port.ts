/**
 * DOIRecordRepositoryPort — persistence for DOIRecord (COMP-026.3).
 * Implemented by PostgresDOIRecordRepository in infrastructure.
 */

import type { ArticleId } from "@syntropy/types";
import type { DOIRecord } from "../doi-record.js";

export interface DOIRecordRepositoryPort {
  findByArticleId(articleId: ArticleId): Promise<DOIRecord | null>;
  save(record: DOIRecord): Promise<void>;
}
