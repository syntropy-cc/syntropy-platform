/**
 * Institution Profile Reader — builds Hub InstitutionProfile from DIP governance (COMP-020.6).
 */

import type { InstitutionProfileReaderPort } from "@syntropy/hub-package";
import type { DigitalInstitutionRepositoryPort } from "@syntropy/dip-governance";
import type { GovernanceQueryService } from "@syntropy/dip-governance";

/**
 * Builds InstitutionProfile from DIP institution and proposal count.
 */
export function createInstitutionProfileReader(
  institutionRepo: DigitalInstitutionRepositoryPort,
  governanceQueryService: GovernanceQueryService
): InstitutionProfileReaderPort {
  return {
    async getProfile(institutionId: string) {
      const summary = await governanceQueryService.getInstitutionSummary(
        institutionId.trim()
      );
      if (!summary) return null;
      const institution = await institutionRepo.findById(institutionId.trim());
      if (!institution) return null;
      return {
        institutionId: institution.institutionId,
        name: institution.name,
        institutionType: institution.type,
        memberCount: 0,
        activeProposalsCount: summary.proposalCount,
        legitimacyChainLength: 0,
        governanceContractSummary:
          institution.governanceContract.slice(0, 200) +
          (institution.governanceContract.length > 200 ? "..." : ""),
        treasuryBalanceAvu: 0,
        openIssueCount: 0,
      };
    },
  };
}
