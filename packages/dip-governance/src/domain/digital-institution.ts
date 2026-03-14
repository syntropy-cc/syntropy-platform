/**
 * DigitalInstitution aggregate — governed digital organization (COMP-007.1).
 * Architecture: DIP Institutional Governance subdomain
 */

export type DigitalInstitutionStatus = "forming" | "active" | "dissolved";

/**
 * DigitalInstitution aggregate. Represents a governed digital organization
 * with a governance contract and lifecycle status.
 */
export class DigitalInstitution {
  readonly institutionId: string;
  readonly name: string;
  readonly type: string;
  readonly governanceContract: string;
  readonly status: DigitalInstitutionStatus;

  private constructor(params: {
    institutionId: string;
    name: string;
    type: string;
    governanceContract: string;
    status: DigitalInstitutionStatus;
  }) {
    this.institutionId = params.institutionId;
    this.name = params.name;
    this.type = params.type;
    this.governanceContract = params.governanceContract;
    this.status = params.status;
  }

  /**
   * Creates a new DigitalInstitution in forming status.
   *
   * @param params.institutionId - Unique identifier
   * @param params.name - Display name
   * @param params.type - Institution type (e.g. laboratory, chamber)
   * @param params.governanceContract - Reference to governance contract (COMP-004)
   */
  static create(params: {
    institutionId: string;
    name: string;
    type: string;
    governanceContract: string;
  }): DigitalInstitution {
    if (!params.institutionId?.trim()) {
      throw new Error("DigitalInstitution.institutionId cannot be empty");
    }
    if (!params.name?.trim()) {
      throw new Error("DigitalInstitution.name cannot be empty");
    }
    if (!params.type?.trim()) {
      throw new Error("DigitalInstitution.type cannot be empty");
    }
    if (!params.governanceContract?.trim()) {
      throw new Error("DigitalInstitution.governanceContract cannot be empty");
    }
    return new DigitalInstitution({
      institutionId: params.institutionId.trim(),
      name: params.name.trim(),
      type: params.type.trim(),
      governanceContract: params.governanceContract.trim(),
      status: "forming",
    });
  }

  /**
   * Reconstructs from persistence (repository use).
   */
  static fromPersistence(params: {
    institutionId: string;
    name: string;
    type: string;
    governanceContract: string;
    status: DigitalInstitutionStatus;
  }): DigitalInstitution {
    return new DigitalInstitution(params);
  }
}
