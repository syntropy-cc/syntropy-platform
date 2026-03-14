/**
 * Unit tests for SponsorshipEventPublisher (COMP-027.5).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sponsorship } from "../../src/domain/sponsorship.js";
import { SponsorshipEventPublisher } from "../../src/infrastructure/sponsorship-event-publisher.js";

describe("SponsorshipEventPublisher", () => {
  const topic = "sponsorship-events";
  let mockPublish: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPublish = vi.fn().mockResolvedValue(undefined);
  });

  it("publishCreated sends sponsorship.created with correct envelope", async () => {
    const producer = { publish: mockPublish };
    const publisher = new SponsorshipEventPublisher(
      producer as never,
      topic
    );
    const sponsorship = new Sponsorship({
      id: "sp-1",
      sponsorId: "user-a",
      sponsoredId: "user-b",
      type: "recurring",
      amount: 50,
      status: "pending",
    });

    await publisher.publishCreated(sponsorship);

    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledWith(topic, {
      eventType: "sponsorship.created",
      payload: {
        sponsorshipId: "sp-1",
        sponsorId: "user-a",
        sponsoredId: "user-b",
        amount: 50,
        status: "pending",
        timestamp: expect.any(String),
      },
      key: "sp-1",
    });
    expect(new Date((mockPublish.mock.calls[0]![1] as { payload: { timestamp: string } }).payload.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("publishPaymentCompleted sends sponsorship.payment.completed with correct envelope", async () => {
    const producer = { publish: mockPublish };
    const publisher = new SponsorshipEventPublisher(
      producer as never,
      topic
    );
    const sponsorship = new Sponsorship({
      id: "sp-2",
      sponsorId: "user-x",
      sponsoredId: "user-y",
      type: "one_time",
      amount: 100,
      status: "active",
    });

    await publisher.publishPaymentCompleted(sponsorship);

    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledWith(topic, {
      eventType: "sponsorship.payment.completed",
      payload: {
        sponsorshipId: "sp-2",
        sponsorId: "user-x",
        sponsoredId: "user-y",
        amount: 100,
        status: "active",
        timestamp: expect.any(String),
      },
      key: "sp-2",
    });
  });
});
