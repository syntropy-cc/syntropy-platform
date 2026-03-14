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
