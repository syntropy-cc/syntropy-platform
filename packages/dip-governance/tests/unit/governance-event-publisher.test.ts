/**
 * Unit tests for GovernanceEventPublisher (COMP-007.7).
 */

import { describe, expect, it, vi } from "vitest";
import { GovernanceEventPublisher } from "../../src/infrastructure/governance-event-publisher.js";

const DIP_GOVERNANCE_TOPIC = "dip.governance.events";

describe("GovernanceEventPublisher", () => {
  it("publishInstitutionCreated sends dip.governance.institution_created with payload", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const producer = { publish };
    const publisher = new GovernanceEventPublisher(producer as never);
    const event = {
      eventType: "dip.governance.institution_created" as const,
      institutionId: "inst-1",
      name: "Test Org",
      type: "laboratory",
      governanceContract: "contract-1",
      timestamp: "2026-03-14T12:00:00.000Z",
    };

    await publisher.publishInstitutionCreated(event);

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(DIP_GOVERNANCE_TOPIC, {
      eventType: "dip.governance.institution_created",
      payload: {
        institutionId: event.institutionId,
        name: event.name,
        type: event.type,
        governanceContract: event.governanceContract,
        timestamp: event.timestamp,
      },
      schemaVersion: 1,
      timestamp: event.timestamp,
    });
  });

  it("publishProposalExecuted sends dip.governance.proposal_executed with payload", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const publisher = new GovernanceEventPublisher({ publish } as never);
    const event = {
      eventType: "dip.governance.proposal_executed" as const,
      institutionId: "inst-1",
      proposalId: "prop-1",
      proposalType: "amendment",
      timestamp: "2026-03-14T12:00:00.000Z",
    };

    await publisher.publishProposalExecuted(event);

    expect(publish).toHaveBeenCalledWith(DIP_GOVERNANCE_TOPIC, {
      eventType: "dip.governance.proposal_executed",
      payload: {
        institutionId: event.institutionId,
        proposalId: event.proposalId,
        proposalType: event.proposalType,
        timestamp: event.timestamp,
      },
      schemaVersion: 1,
      timestamp: event.timestamp,
    });
  });

  it("publishProposalOpened sends dip.governance.proposal_opened with payload", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const publisher = new GovernanceEventPublisher({ publish } as never);
    const event = {
      eventType: "dip.governance.proposal_opened" as const,
      institutionId: "inst-1",
      proposalId: "prop-1",
      proposalType: "amendment",
      timestamp: "2026-03-14T11:00:00.000Z",
    };

    await publisher.publishProposalOpened(event);

    expect(publish).toHaveBeenCalledWith(DIP_GOVERNANCE_TOPIC, {
      eventType: "dip.governance.proposal_opened",
      payload: {
        institutionId: event.institutionId,
        proposalId: event.proposalId,
        proposalType: event.proposalType,
        timestamp: event.timestamp,
      },
      schemaVersion: 1,
      timestamp: event.timestamp,
    });
  });
});
