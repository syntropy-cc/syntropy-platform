/**
 * Integration tests for GET /api/v1/hub/discover (COMP-021.5).
 * Uses InMemoryDiscoveryRepository; no auth required for discover.
 */

import {
  InMemoryDiscoveryRepository,
  createEmptyDocument,
  withProminenceScore,
} from "@syntropy/hub-package";
import { describe, it, expect, beforeAll } from "vitest";
import { createApp } from "../server.js";
import type { HubCollaborationContext } from "../types/hub-context.js";

function createStubHubContext(discoveryRepository: InMemoryDiscoveryRepository): HubCollaborationContext {
  const stubIssueRepo = {
    save: async () => {},
    getById: async () => null,
    listByProjectId: async () => [],
    listAll: async () => [],
  };
  const stubContributionRepo = {
    getById: async () => null,
    listByProjectId: async () => [],
    save: async () => {},
  };
  const stubContributionIntegration = {
    merge: async () => {
      throw new Error("not used in discover test");
    },
  };
  return {
    issueRepository: stubIssueRepo as any,
    contributionRepository: stubContributionRepo as any,
    contributionIntegrationService: stubContributionIntegration as any,
    discoveryRepository,
  };
}

describe("GET /api/v1/hub/discover (COMP-021.5)", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    const discoveryRepository = new InMemoryDiscoveryRepository();
    await discoveryRepository.upsert(
      withProminenceScore(createEmptyDocument("inst-1", "Acme Lab"), 80)
    );
    await discoveryRepository.upsert(
      withProminenceScore(createEmptyDocument("inst-2", "Beta Org"), 60)
    );
    await discoveryRepository.upsert(
      withProminenceScore(createEmptyDocument("inst-3", "Acme Research"), 40)
    );

    app = await createApp({
      hub: createStubHubContext(discoveryRepository),
    });
  });

  it("GET /api/v1/hub/discover returns 200 and list without auth", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/hub/discover",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: Array<{ institutionId: string; name: string; prominenceScore: number }>; meta: unknown };
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(3);
    expect(body.meta).toBeDefined();
    expect(body.data[0].institutionId).toBe("inst-1");
    expect(body.data[0].name).toBe("Acme Lab");
    expect(body.data[0].prominenceScore).toBe(80);
  });

  it("GET /api/v1/hub/discover?search=Acme returns filtered list", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/hub/discover?search=Acme",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: Array<{ name: string }> };
    expect(body.data.length).toBe(2);
    expect(body.data.every((d) => d.name.includes("Acme"))).toBe(true);
  });

  it("GET /api/v1/hub/discover?limit=2 returns at most 2 items", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/hub/discover?limit=2",
    });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { data: unknown[] };
    expect(body.data.length).toBe(2);
  });
});
