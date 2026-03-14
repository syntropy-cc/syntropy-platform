/**
 * DIP Institution Adapter — implements Hub's DIPInstitutionAdapterPort using DIP governance (COMP-020.6).
 */

import { randomUUID } from "node:crypto";
import { DigitalInstitution } from "@syntropy/dip-governance";
import type {
  DIPInstitutionAdapterPort,
  CreateInstitutionParams,
} from "@syntropy/hub-package";
import type { DigitalInstitutionRepositoryPort } from "@syntropy/dip-governance";

/**
 * Creates institutions in DIP via the governance repository.
 * Used when Hub orchestration completes the workflow.
 */
export function createDIPInstitutionAdapter(
  institutionRepo: DigitalInstitutionRepositoryPort
): DIPInstitutionAdapterPort {
  return {
    async createInstitution(params: CreateInstitutionParams) {
      const institutionId = "inst-" + randomUUID().slice(0, 8);
      const institution = DigitalInstitution.create({
        institutionId,
        name: params.name.trim(),
        type: params.type.trim(),
        governanceContract: params.governanceContract.trim(),
      });
      await institutionRepo.save(institution);
      return { institutionId };
    },
  };
}
