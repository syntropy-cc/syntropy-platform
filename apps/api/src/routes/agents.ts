/**
 * Agent Registry REST routes (COMP-013.4, COMP-013.5).
 *
 * POST /api/v1/agents — register agent (admin only).
 * GET /api/v1/agents — list agents (public read).
 * GET /api/v1/agents/:id — get agent by id (public read).
 * GET /api/v1/agents/:id/tools — get tools for agent (public read).
 * GET /api/v1/agents/tools/:toolId/can-invoke — check tool permission (auth required); 403 if insufficient role.
 * POST /api/v1/agents/tools/validate — validate tool params against schema; 400 if invalid.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  createAIAgentDefinition,
  createToolDefinition,
  ToolPermissionEvaluator,
  validateToolInput,
} from "@syntropy/ai-agents";
import { z } from "zod";
import { successEnvelope, errorEnvelope } from "../types/api-envelope.js";
import type { AiAgentsContext } from "../types/ai-agents-context.js";

const ADMIN_ROLE = "admin";

/** Agent DTO for response. */
export interface AgentDto {
  agentId: string;
  name: string;
  pillar: string;
  toolIds: string[];
  systemPromptId: string;
}

/** Tool DTO for response (no schema in payload). */
export interface ToolDto {
  toolId: string;
  name: string;
  description?: string;
  requiredRole: string;
}

function getRequestId(request: FastifyRequest): string | undefined {
  return request.correlationId;
}

/** Body for POST /api/v1/agents. */
interface RegisterAgentBody {
  agentId: string;
  name: string;
  pillar: string;
  toolIds: string[];
  systemPromptId: string;
  tools?: Array<{
    toolId: string;
    name: string;
    description?: string;
    requiredRole: string;
  }>;
}

function isRegisterAgentBody(value: unknown): value is RegisterAgentBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (
    typeof o.agentId !== "string" ||
    typeof o.name !== "string" ||
    typeof o.pillar !== "string" ||
    !Array.isArray(o.toolIds) ||
    typeof o.systemPromptId !== "string"
  )
    return false;
  if (!o.toolIds.every((id): id is string => typeof id === "string"))
    return false;
  if (o.tools !== undefined) {
    if (!Array.isArray(o.tools)) return false;
    for (const t of o.tools) {
      if (
        typeof t !== "object" ||
        t === null ||
        typeof (t as Record<string, unknown>).toolId !== "string" ||
        typeof (t as Record<string, unknown>).name !== "string" ||
        typeof (t as Record<string, unknown>).requiredRole !== "string"
      )
        return false;
    }
  }
  return true;
}

function agentToDto(
  agent: { agentId: string; name: string; pillar: string; toolIds: readonly string[]; systemPromptId: string }
): AgentDto {
  return {
    agentId: agent.agentId,
    name: agent.name,
    pillar: agent.pillar,
    toolIds: [...agent.toolIds],
    systemPromptId: agent.systemPromptId,
  };
}

export async function agentsRoutes(
  fastify: FastifyInstance,
  opts: { aiAgents: AiAgentsContext }
): Promise<void> {
  const { agentRegistry, toolStore } = opts.aiAgents;
  const requireAuth = fastify.requireAuth;

  /** PreHandler: require auth then require admin role. */
  async function requireAdmin(
    request: FastifyRequest,
    reply: Parameters<typeof requireAuth>[1]
  ): Promise<void> {
    await requireAuth(request, reply);
    if (reply.sent) return;
    const roles = request.user?.roles ?? [];
    if (!roles.includes(ADMIN_ROLE)) {
      return reply.status(403).send(
        errorEnvelope(
          "FORBIDDEN",
          "Admin role required to register agents.",
          getRequestId(request)
        )
      );
    }
  }

  fastify.post<{ Body: unknown }>(
    "/api/v1/agents",
    { preHandler: [requireAdmin] },
    async (request, reply) => {
      const body = request.body;
      if (body === undefined || body === null || !isRegisterAgentBody(body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { agentId, name, pillar, toolIds[], systemPromptId, tools?: [] }.",
            getRequestId(request)
          )
        );
      }
      const definition = createAIAgentDefinition({
        agentId: body.agentId,
        name: body.name,
        pillar: body.pillar,
        toolIds: body.toolIds,
        systemPromptId: body.systemPromptId,
      });
      await agentRegistry.register(definition);
      if (body.tools?.length) {
        for (const t of body.tools) {
          const tool = createToolDefinition({
            toolId: t.toolId,
            name: t.name,
            description: t.description,
            inputSchema: z.record(z.unknown()),
            requiredRole: t.requiredRole,
          });
          toolStore.register(tool);
        }
      }
      return reply.status(201).send(
        successEnvelope(agentToDto(definition), getRequestId(request))
      );
    }
  );

  fastify.get("/api/v1/agents", async (request, reply) => {
    const agents = await agentRegistry.findAll();
    return reply.send(
      successEnvelope(agents.map(agentToDto), getRequestId(request))
    );
  });

  /** Tool permission check (COMP-013.5): 403 when user lacks required role. Register before :id so /agents/tools/... matches. */
  fastify.get<{ Params: { toolId: string } }>(
    "/api/v1/agents/tools/:toolId/can-invoke",
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const userId = request.user!.userId;
      const { toolId } = request.params;
      const toolResolver = (id: string) => toolStore.get(id);
      const roleResolver = async () => request.user?.roles ?? [];
      const cache = new Map<string, boolean>();
      const evaluator = new ToolPermissionEvaluator(
        toolResolver,
        roleResolver,
        { get: (k) => cache.get(k), set: (k, v) => cache.set(k, v) }
      );
      const allowed = await evaluator.canInvoke(userId, toolId);
      if (!allowed) {
        return reply.status(403).send(
          errorEnvelope(
            "FORBIDDEN",
            "Insufficient role to invoke this tool.",
            getRequestId(request)
          )
        );
      }
      return reply.send(
        successEnvelope({ canInvoke: true }, getRequestId(request))
      );
    }
  );

  /** Tool param validation (COMP-013.5): 400 when params fail schema. */
  fastify.post<{ Body: unknown }>(
    "/api/v1/agents/tools/validate",
    async (request, reply) => {
      const body = request.body;
      if (body === null || typeof body !== "object" || !("toolId" in body) || !("params" in body)) {
        return reply.status(400).send(
          errorEnvelope(
            "BAD_REQUEST",
            "Body must be { toolId: string, params: unknown }.",
            getRequestId(request)
          )
        );
      }
      const { toolId, params } = body as { toolId: unknown; params: unknown };
      if (typeof toolId !== "string") {
        return reply.status(400).send(
          errorEnvelope("BAD_REQUEST", "toolId must be a string.", getRequestId(request))
        );
      }
      const tool = toolStore.get(toolId);
      if (!tool) {
        return reply.status(404).send(
          errorEnvelope("NOT_FOUND", `Tool ${toolId} not found.`, getRequestId(request))
        );
      }
      try {
        validateToolInput(tool, params);
      } catch (err: unknown) {
        const zodErr = err as { name?: string; errors?: unknown[] };
        if (zodErr?.name === "ZodError" || (zodErr && Array.isArray(zodErr.errors))) {
          return reply.status(400).send(
            errorEnvelope(
              "VALIDATION_ERROR",
              "Tool params failed schema validation.",
              getRequestId(request),
              { details: zodErr.errors ?? [] }
            )
          );
        }
        throw err;
      }
      return reply.send(
        successEnvelope({ valid: true }, getRequestId(request))
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/agents/:id",
    async (request, reply) => {
      const { id } = request.params;
      const agents = await agentRegistry.findAll();
      const agent = agents.find((a) => a.agentId === id);
      if (!agent) {
        return reply.status(404).send(
          errorEnvelope("NOT_FOUND", `Agent ${id} not found.`, getRequestId(request))
        );
      }
      return reply.send(
        successEnvelope(agentToDto(agent), getRequestId(request))
      );
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/api/v1/agents/:id/tools",
    async (request, reply) => {
      const { id } = request.params;
      const agents = await agentRegistry.findAll();
      const agent = agents.find((a) => a.agentId === id);
      if (!agent) {
        return reply.status(404).send(
          errorEnvelope("NOT_FOUND", `Agent ${id} not found.`, getRequestId(request))
        );
      }
      const tools: ToolDto[] = [];
      for (const toolId of agent.toolIds) {
        const tool = toolStore.get(toolId);
        if (tool) {
          tools.push({
            toolId: tool.toolId,
            name: tool.name,
            description: tool.description,
            requiredRole: tool.requiredRole,
          });
        }
      }
      return reply.send(
        successEnvelope(tools, getRequestId(request))
      );
    }
  );
}
