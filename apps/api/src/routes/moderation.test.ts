/**
 * Integration tests for Moderation and Community Proposals routes (COMP-031.6).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { createApp } from "../server.js";
import type { GovernanceModerationContext } from "../types/governance-moderation-context.js";
import {
  ModerationFlag,
  ModerationAction,
  CommunityProposal,
  FlagStatus,
  ActionType,
  ProposalStatus,
} from "@syntropy/governance-moderation";
import {
  IdentityToken,
  createActorId,
  InvalidTokenError,
  type AuthProvider,
} from "@syntropy/identity";

const USER_ID = "a1b2c3d4-e5f6-4789-a012-345678901234";
const MODERATOR_ID = "b2c3d4e5-f6a7-4890-b123-456789012345";
const VALID_JWT = "valid-moderation-test-jwt";
const MODERATOR_JWT = "valid-moderator-test-jwt";

function createMockAuth(jwt: string, userId: string, roles: string[]): AuthProvider {
  const token = IdentityToken.fromClaims({
    sub: userId,
    actor_id: createActorId(userId),
    roles,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  });
  return {
    async verifyToken(jwtStr: string) {
      if (jwtStr !== jwt) throw new InvalidTokenError("Invalid or expired token");
      return token;
    },
    async signIn() {
      return token;
    },
    async signOut() {},
  };
}

function createInMemoryGovernanceModerationContext(): GovernanceModerationContext {
  const flags = new Map<string, ModerationFlag>();
  const actions = new Map<string, ModerationAction>();
  const proposals = new Map<string, CommunityProposal>();

  return {
    async recordFlag(params) {
      const flagId = randomUUID();
      const flag = ModerationFlag.create({
        flagId,
        entityType: params.entityType,
        entityId: params.entityId,
        reason: params.reason,
      });
      flags.set(flag.flagId, flag);
      return flag;
    },
    async listFlags(opts = {}) {
      let list = Array.from(flags.values());
      if (opts.status) {
        list = list.filter((f) => f.status === opts.status);
      }
      const offset = opts.offset ?? 0;
      const limit = opts.limit ?? 20;
      return list.slice(offset, offset + limit);
    },
    async recordAction(params) {
      const id = randomUUID();
      const action = ModerationAction.create({
        id,
        flagId: params.flagId,
        moderatorId: params.moderatorId,
        actionType: params.actionType,
        reason: params.reason,
      });
      actions.set(action.id, action);
      return action;
    },
    async createProposal(params) {
      const id = randomUUID();
      const proposal = CommunityProposal.create({
        id,
        authorId: params.authorId,
        title: params.title,
        description: params.description,
        proposalType: params.proposalType,
      });
      proposals.set(proposal.id, proposal);
      return proposal;
    },
    async getProposal(id: string) {
      return proposals.get(id) ?? null;
    },
    async voteProposal(proposalId: string) {
      const p = proposals.get(proposalId);
      if (!p) throw new Error("Proposal not found");
      let next = p;
      if (next.status === ProposalStatus.Draft) {
        next = next.openDiscussion().startVoting();
      } else if (next.status === ProposalStatus.Discussion) {
        next = next.startVoting();
      }
      if (next.status !== ProposalStatus.Voting) {
        throw new Error("Proposal is not in voting phase");
      }
      const updated = next.recordVote();
      proposals.set(updated.id, updated);
      return updated;
    },
  };
}

describe("moderation routes (COMP-031.6)", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  const ctx = createInMemoryGovernanceModerationContext();

  beforeAll(async () => {
    app = await createApp({
      auth: createMockAuth(VALID_JWT, USER_ID, ["Learner"]),
      supabaseClient: null,
      governanceModeration: ctx,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /api/v1/moderation/flags", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/moderation/flags",
        payload: { entityType: "post", entityId: "p1", reason: "Spam" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 201 and flag when authenticated", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/moderation/flags",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { entityType: "post", entityId: "p1", reason: "Spam content" },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data).toBeDefined();
      expect(body.data.flagId).toBeDefined();
      expect(body.data.entityType).toBe("post");
      expect(body.data.entityId).toBe("p1");
      expect(body.data.reason).toBe("Spam content");
      expect(body.data.status).toBe(FlagStatus.Pending);
    });

    it("returns 400 when body is invalid", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/moderation/flags",
        headers: { authorization: `Bearer ${VALID_JWT}` },
        payload: { entityType: "post", entityId: "p1" },
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/moderation/flags", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/moderation/flags",
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 403 when user is not moderator", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/moderation/flags",
        headers: { authorization: `Bearer ${VALID_JWT}` },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().error?.message).toContain("PlatformModerator");
    });
  });
});

describe("moderation routes with moderator (COMP-031.6)", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  const ctx = createInMemoryGovernanceModerationContext();

  beforeAll(async () => {
    app = await createApp({
      auth: createMockAuth(MODERATOR_JWT, MODERATOR_ID, ["Learner", "PlatformModerator"]),
      supabaseClient: null,
      governanceModeration: ctx,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/moderation/flags returns 200 for moderator", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/moderation/flags",
      headers: { authorization: `Bearer ${MODERATOR_JWT}` },
    });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.json().data)).toBe(true);
  });

  it("POST /api/v1/moderation/actions returns 201 for moderator", async () => {
    const flagRes = await app.inject({
      method: "POST",
      url: "/api/v1/moderation/flags",
      headers: { authorization: `Bearer ${MODERATOR_JWT}` },
      payload: { entityType: "comment", entityId: "c1", reason: "Abuse" },
    });
    const flagId = flagRes.json().data.flagId;
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/moderation/actions",
      headers: { authorization: `Bearer ${MODERATOR_JWT}` },
      payload: { flagId, actionType: ActionType.Remove, reason: "Policy violation" },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().data.actionType).toBe(ActionType.Remove);
    expect(res.json().data.moderatorId).toBe(MODERATOR_ID);
  });
});

describe("community-proposals routes (COMP-031.6)", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  const ctx = createInMemoryGovernanceModerationContext();

  beforeAll(async () => {
    app = await createApp({
      auth: createMockAuth(VALID_JWT, USER_ID, ["Learner"]),
      supabaseClient: null,
      governanceModeration: ctx,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /api/v1/community-proposals returns 401 when not authenticated", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/community-proposals",
      payload: {
        title: "Feature X",
        description: "Add feature X",
        proposalType: "feature_request",
      },
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/community-proposals returns 201 when authenticated", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/community-proposals",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        title: "Feature X",
        description: "Add feature X",
        proposalType: "feature_request",
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.id).toBeDefined();
    expect(body.data.title).toBe("Feature X");
    expect(body.data.status).toBe(ProposalStatus.Draft);
    expect(body.data.voteCount).toBe(0);
  });

  it("POST /api/v1/community-proposals/:id/vote returns 200 and increments vote", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/community-proposals",
      headers: { authorization: `Bearer ${VALID_JWT}` },
      payload: {
        title: "Vote test",
        description: "D",
        proposalType: "feature_request",
      },
    });
    const proposalId = createRes.json().data.id;
    const voteRes = await app.inject({
      method: "POST",
      url: `/api/v1/community-proposals/${proposalId}/vote`,
      headers: { authorization: `Bearer ${VALID_JWT}` },
    });
    expect(voteRes.statusCode).toBe(200);
    expect(voteRes.json().data.voteCount).toBe(1);
  });
});
