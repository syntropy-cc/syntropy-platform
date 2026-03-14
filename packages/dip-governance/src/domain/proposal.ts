/**
 * Proposal aggregate — governance proposal with open/close/execute (COMP-007.2).
 * Architecture: DIP Institutional Governance subdomain
 */

import {
  ProposalStatus,
  type ProposalStatusValue,
} from "./proposal-status.js";

/**
 * Thrown when a proposal transition is not allowed from the current status.
 */
export class InvalidProposalTransitionError extends Error {
  constructor(
    public readonly fromStatus: string,
    public readonly toStatus: string,
    public readonly proposalId: string
  ) {
    super(
      `Invalid proposal transition: cannot move proposal ${proposalId} from "${fromStatus}" to "${toStatus}"`
    );
    this.name = "InvalidProposalTransitionError";
    Object.setPrototypeOf(this, InvalidProposalTransitionError.prototype);
  }
}

/**
 * Proposal aggregate. Lifecycle: open → closed → executed.
 */
export class Proposal {
  readonly proposalId: string;
  readonly institutionId: string;
  readonly type: string;
  readonly status: ProposalStatusValue;

  private constructor(params: {
    proposalId: string;
    institutionId: string;
    type: string;
    status: ProposalStatusValue;
  }) {
    this.proposalId = params.proposalId;
    this.institutionId = params.institutionId;
    this.type = params.type;
    this.status = params.status;
  }

  /**
   * Creates a new Proposal in open status.
   */
  static open(params: {
    proposalId: string;
    institutionId: string;
    type: string;
  }): Proposal {
    if (!params.proposalId?.trim()) {
      throw new Error("Proposal.proposalId cannot be empty");
    }
    if (!params.institutionId?.trim()) {
      throw new Error("Proposal.institutionId cannot be empty");
    }
    if (!params.type?.trim()) {
      throw new Error("Proposal.type cannot be empty");
    }
    return new Proposal({
      proposalId: params.proposalId.trim(),
      institutionId: params.institutionId.trim(),
      type: params.type.trim(),
      status: ProposalStatus.Open,
    });
  }

  /**
   * Reconstructs from persistence (repository use).
   */
  static fromPersistence(params: {
    proposalId: string;
    institutionId: string;
    type: string;
    status: ProposalStatusValue;
  }): Proposal {
    return new Proposal(params);
  }

  /**
   * Transitions from open to closed. Only open proposals can be closed.
   */
  close(): Proposal {
    if (this.status !== ProposalStatus.Open) {
      throw new InvalidProposalTransitionError(
        this.status,
        ProposalStatus.Closed,
        this.proposalId
      );
    }
    return new Proposal({
      proposalId: this.proposalId,
      institutionId: this.institutionId,
      type: this.type,
      status: ProposalStatus.Closed,
    });
  }

  /**
   * Transitions from closed to executed. Only closed proposals can be executed.
   */
  execute(): Proposal {
    if (this.status !== ProposalStatus.Closed) {
      throw new InvalidProposalTransitionError(
        this.status,
        ProposalStatus.Executed,
        this.proposalId
      );
    }
    return new Proposal({
      proposalId: this.proposalId,
      institutionId: this.institutionId,
      type: this.type,
      status: ProposalStatus.Executed,
    });
  }
}
