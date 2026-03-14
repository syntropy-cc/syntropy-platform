/**
 * ContributionSandbox aggregate — isolated challenge environment (COMP-019.3).
 * Architecture: Hub Collaboration Layer, ADR-011. Business logic only; provisioning in COMP-019.6.
 */

import type { HubHackinCompleted, HubHackinStarted } from "./events.js";
import {
  ContributionSandboxStatus,
  type ContributionSandboxStatusValue,
} from "./contribution-sandbox-status.js";

/** Sandbox configuration: resource limits and challenge definition. */
export interface SandboxConfig {
  maxParticipants?: number;
  challengeDefinition?: Record<string, unknown>;
}

export interface ContributionSandboxParams {
  id: string;
  projectId: string;
  title: string;
  challengeDescription: string;
  status: ContributionSandboxStatusValue;
  config: SandboxConfig;
  ideSessionId: string | null;
  challengeIssueIds: string[];
  participantContributionIds: string[];
  startedAt: Date | null;
  completedAt: Date | null;
}

/**
 * ContributionSandbox aggregate. Lifecycle: setting_up → active (activate) → completed (complete).
 * Container provisioning is delegated to ContainerOrchestratorPort (stub in S31).
 */
export class ContributionSandbox {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly challengeDescription: string;
  readonly status: ContributionSandboxStatusValue;
  readonly config: SandboxConfig;
  readonly ideSessionId: string | null;
  readonly challengeIssueIds: string[];
  readonly participantContributionIds: string[];
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;

  private constructor(params: ContributionSandboxParams) {
    this.id = params.id;
    this.projectId = params.projectId;
    this.title = params.title;
    this.challengeDescription = params.challengeDescription;
    this.status = params.status;
    this.config = { ...params.config };
    this.ideSessionId = params.ideSessionId;
    this.challengeIssueIds = [...params.challengeIssueIds];
    this.participantContributionIds = [...params.participantContributionIds];
    this.startedAt = params.startedAt;
    this.completedAt = params.completedAt;
  }

  /**
   * Creates a new ContributionSandbox in setting_up status.
   */
  static create(params: {
    id: string;
    projectId: string;
    title: string;
    challengeDescription: string;
    config?: SandboxConfig;
  }): ContributionSandbox {
    if (!params.title?.trim()) {
      throw new Error("ContributionSandbox.title cannot be empty");
    }
    return new ContributionSandbox({
      ...params,
      title: params.title.trim(),
      challengeDescription: params.challengeDescription?.trim() ?? "",
      status: ContributionSandboxStatus.SettingUp,
      config: params.config ?? {},
      ideSessionId: null,
      challengeIssueIds: [],
      participantContributionIds: [],
      startedAt: null,
      completedAt: null,
    });
  }

  /**
   * Reconstructs from persistence.
   */
  static fromPersistence(params: ContributionSandboxParams): ContributionSandbox {
    return new ContributionSandbox(params);
  }

  /**
   * Transitions to active with the given IDE session id. Only valid from setting_up.
   */
  activate(ideSessionId: string): { sandbox: ContributionSandbox; event: HubHackinStarted } {
    if (this.status !== ContributionSandboxStatus.SettingUp) {
      throw new Error(
        `ContributionSandbox.activate: expected status setting_up, got ${this.status}`
      );
    }
    const sessionId = ideSessionId.trim();
    if (!sessionId) {
      throw new Error("ContributionSandbox.activate: ideSessionId cannot be empty");
    }
    const now = new Date();
    const sandbox = new ContributionSandbox({
      ...this._params(),
      status: ContributionSandboxStatus.Active,
      ideSessionId: sessionId,
      startedAt: now,
    });
    const event: HubHackinStarted = {
      type: "hub.hackin.started",
      sandboxId: this.id,
      projectId: this.projectId,
      title: this.title,
      status: ContributionSandboxStatus.Active,
      occurredAt: now,
    };
    return { sandbox, event };
  }

  /**
   * Transitions to completed. Only valid from active. Aggregates participant contributions.
   */
  complete(): { sandbox: ContributionSandbox; event: HubHackinCompleted } {
    if (this.status !== ContributionSandboxStatus.Active) {
      throw new Error(
        `ContributionSandbox.complete: expected status active, got ${this.status}`
      );
    }
    const now = new Date();
    const sandbox = new ContributionSandbox({
      ...this._params(),
      status: ContributionSandboxStatus.Completed,
      completedAt: now,
    });
    const event: HubHackinCompleted = {
      type: "hub.hackin.completed",
      sandboxId: this.id,
      projectId: this.projectId,
      participantContributionIds: [...this.participantContributionIds],
      occurredAt: now,
    };
    return { sandbox, event };
  }

  /**
   * Adds a challenge issue id (e.g. when orchestrator creates issues on activation).
   */
  addChallengeIssue(issueId: string): ContributionSandbox {
    if (this.challengeIssueIds.includes(issueId)) {
      return this;
    }
    return new ContributionSandbox({
      ...this._params(),
      challengeIssueIds: [...this.challengeIssueIds, issueId],
    });
  }

  /**
   * Records a participant contribution id.
   */
  addParticipantContribution(contributionId: string): ContributionSandbox {
    if (this.participantContributionIds.includes(contributionId)) {
      return this;
    }
    return new ContributionSandbox({
      ...this._params(),
      participantContributionIds: [
        ...this.participantContributionIds,
        contributionId,
      ],
    });
  }

  private _params(): ContributionSandboxParams {
    return {
      id: this.id,
      projectId: this.projectId,
      title: this.title,
      challengeDescription: this.challengeDescription,
      status: this.status,
      config: this.config,
      ideSessionId: this.ideSessionId,
      challengeIssueIds: this.challengeIssueIds,
      participantContributionIds: this.participantContributionIds,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
    };
  }
}
