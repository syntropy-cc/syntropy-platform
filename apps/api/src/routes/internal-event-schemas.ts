/**
 * Internal schema registry API (COMP-009.8).
 *
 * GET /internal/event-schemas — list all registered schemas.
 * GET /internal/event-schemas?topic=&version= — get single schema (404 if not found).
 * POST /internal/event-schemas — register new schema version (admin-only).
 *
 * Admin guard: when INTERNAL_API_KEY env is set, requests must include
 * X-Internal-API-Key header matching it; otherwise 403. Replaced by RBAC in S7 (COMP-037.1).
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import {
  SchemaRegistry,
  IncompatibleSchemaError,
  type JsonSchemaDefinition,
} from "@syntropy/event-bus";

const INTERNAL_API_KEY_HEADER = "x-internal-api-key";

function getRequiredApiKey(): string | undefined {
  const key = process.env.INTERNAL_API_KEY;
  return key === undefined || key === "" ? undefined : key;
}

/**
 * Returns 403 if INTERNAL_API_KEY is set and request does not provide a matching key.
 */
async function requireAdminKey(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  const required = getRequiredApiKey();
  if (required === undefined) return true;

  const provided = request.headers[INTERNAL_API_KEY_HEADER];
  const value = typeof provided === "string" ? provided : undefined;
  if (value !== required) {
    await reply.status(403).send({
      error: "Forbidden",
      message: "Admin API key required for internal endpoints.",
    });
    return false;
  }
  return true;
}

interface PostBody {
  topic: string;
  schema: JsonSchemaDefinition;
  version: number;
}

function isPostBody(value: unknown): value is PostBody {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.topic === "string" &&
    typeof o.schema === "object" &&
    o.schema !== null &&
    typeof o.version === "number"
  );
}

async function internalEventSchemasRoutes(
  fastify: FastifyInstance,
  _opts: Record<string, unknown>,
): Promise<void> {
  const registry = new SchemaRegistry();
  fastify.decorate("schemaRegistry", registry);

  fastify.get<{
    Querystring: { topic?: string; version?: string };
  }>("/internal/event-schemas", async (request, reply) => {
    if (!(await requireAdminKey(request, reply))) return;

    const { topic: topicQ, version: versionQ } = request.query;

    if (topicQ !== undefined && topicQ !== "") {
      const versionNum =
        versionQ !== undefined && versionQ !== ""
          ? parseInt(versionQ, 10)
          : undefined;
      if (Number.isNaN(versionNum) && versionQ !== undefined && versionQ !== "") {
        return reply.status(400).send({
          error: "Bad Request",
          message: "version must be a number",
        });
      }
      const schema = registry.get(topicQ, versionNum);
      if (schema === undefined) {
        return reply.status(404).send({
          error: "Not Found",
          message: `No schema for topic "${topicQ}"${versionNum !== undefined ? ` version ${versionNum}` : ""}`,
        });
      }
      const v = versionNum ?? registry.getLatestVersion(topicQ);
      return reply.send({ topic: topicQ, version: v, schema });
    }

    const list = registry.listAll();
    return reply.send(list);
  });

  fastify.post<{ Body: unknown }>("/internal/event-schemas", async (request, reply) => {
    if (!(await requireAdminKey(request, reply))) return;

    if (!isPostBody(request.body)) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Body must be { topic: string, schema: object, version: number }",
      });
    }

    const { topic, schema, version } = request.body;
    if (version < 1 || !Number.isInteger(version)) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "version must be a positive integer",
      });
    }

    try {
      registry.register(topic, schema, version);
    } catch (err) {
      if (err instanceof IncompatibleSchemaError) {
        return reply.status(400).send({
          error: "IncompatibleSchemaError",
          message: err.message,
          details: err.details,
        });
      }
      throw err;
    }

    return reply.status(201).send({ topic, version, schema });
  });
}

declare module "fastify" {
  interface FastifyInstance {
    schemaRegistry: SchemaRegistry;
  }
}

export const internalEventSchemasPlugin = fp(internalEventSchemasRoutes, {
  name: "internal-event-schemas",
});
