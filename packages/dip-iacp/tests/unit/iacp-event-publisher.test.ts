/**
 * Unit tests for IACPEventPublisher (COMP-005.7).
 */

import { describe, expect, it, vi } from "vitest";
import { IACPEventPublisher } from "../../src/infrastructure/iacp-event-publisher.js";

const DIP_IACP_TOPIC = "dip.iacp.events";

describe("IACPEventPublisher", () => {
  it("publishCreated sends dip.iacp.created with payload", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const producer = { publish };
    const publisher = new IACPEventPublisher(producer as never);
    const event = {
      eventType: "dip.iacp.created" as const,
      iacpId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      type: "usage_agreement",
      institutionId: "inst-1",
      timestamp: "2024-01-15T10:00:00.000Z",
    };

    await publisher.publishCreated(event);

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(DIP_IACP_TOPIC, {
      eventType: "dip.iacp.created",
      payload: {
        iacpId: event.iacpId,
        type: event.type,
        institutionId: event.institutionId,
        timestamp: event.timestamp,
      },
      schemaVersion: 1,
      timestamp: event.timestamp,
    });
  });

  it("publishActivated sends dip.iacp.activated with payload", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const publisher = new IACPEventPublisher({ publish } as never);
    const event = {
      eventType: "dip.iacp.activated" as const,
      iacpId: "a1000000-0000-4000-8000-000000000001",
      type: "governance",
      timestamp: "2024-01-15T11:00:00.000Z",
    };

    await publisher.publishActivated(event);

    expect(publish).toHaveBeenCalledWith(DIP_IACP_TOPIC, {
      eventType: "dip.iacp.activated",
      payload: {
        iacpId: event.iacpId,
        type: event.type,
        institutionId: undefined,
        timestamp: event.timestamp,
      },
      schemaVersion: 1,
      timestamp: event.timestamp,
    });
  });

  it("publishTerminated sends dip.iacp.terminated with payload", async () => {
    const publish = vi.fn().mockResolvedValue(undefined);
    const publisher = new IACPEventPublisher({ publish } as never);
    const event = {
      eventType: "dip.iacp.terminated" as const,
      iacpId: "b2000000-0000-4000-8000-000000000002",
      type: "usage_agreement",
      institutionId: "inst-2",
      timestamp: "2024-01-15T12:00:00.000Z",
    };

    await publisher.publishTerminated(event);

    expect(publish).toHaveBeenCalledWith(DIP_IACP_TOPIC, {
      eventType: "dip.iacp.terminated",
      payload: {
        iacpId: event.iacpId,
        type: event.type,
        institutionId: event.institutionId,
        timestamp: event.timestamp,
      },
      schemaVersion: 1,
      timestamp: event.timestamp,
    });
  });
});
