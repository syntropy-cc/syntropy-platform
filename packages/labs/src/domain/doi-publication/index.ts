/**
 * DOI publication domain (COMP-026).
 * Architecture: doi-external-publication.md
 */

export {
  DOIStatus,
  isDOIStatus,
  isRegisteredOrFindable,
} from "./doi-status.js";
export {
  DOIRecord,
  createDoiRecordId,
  isDoiRecordId,
  type DOIRecordParams,
  type DoiRecordId,
} from "./doi-record.js";
export type { DOIRecordRepositoryPort } from "./ports/doi-record-repository-port.js";
export type {
  DOIProvider,
  ArticleDOIMetadata,
  RegisterDOIResult,
} from "./ports/doi-provider.js";
