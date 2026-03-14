/**
 * DIPInstitutionAdapterPort — ACL to DIP Institutional Governance (COMP-020.4).
 * Hub depends on this abstraction; apps wire the implementation (e.g. governance repo).
 */

export interface CreateInstitutionParams {
  name: string;
  type: string;
  governanceContract: string;
}

export interface CreateInstitutionResult {
  institutionId: string;
}

/**
 * Port for creating a Digital Institution in DIP. Implement in infrastructure (e.g. apps/api).
 */
export interface DIPInstitutionAdapterPort {
  createInstitution(params: CreateInstitutionParams): Promise<CreateInstitutionResult>;
}
