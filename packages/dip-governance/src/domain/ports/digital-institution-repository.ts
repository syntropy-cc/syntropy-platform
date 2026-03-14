/**
 * Port for loading and saving DigitalInstitution aggregate (COMP-007.6).
 * Architecture: DIP Institutional Governance — dependency inversion
 */

import type { DigitalInstitution } from "../digital-institution.js";

export interface DigitalInstitutionRepositoryPort {
  findById(institutionId: string): Promise<DigitalInstitution | null>;
  save(institution: DigitalInstitution): Promise<void>;
}
