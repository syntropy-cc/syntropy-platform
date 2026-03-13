/**
 * In-memory schema registry for event topics and versions.
 *
 * Architecture: COMP-009.2
 */

import type { EventSchema, JsonSchemaDefinition } from "./EventSchema.js";
import { checkBackwardCompatible } from "./compatibility.js";

/**
 * In-memory store: topic -> version -> schema definition.
 */
export class SchemaRegistry {
  private readonly byTopic = new Map<string, Map<number, JsonSchemaDefinition>>();
  private readonly latestVersionByTopic = new Map<string, number>();

  /**
   * Registers a schema for a topic at the given version.
   * If a schema already exists for this topic, runs a backward-compatibility check.
   *
   * @throws IncompatibleSchemaError if new schema breaks compatibility with existing
   */
  register(topic: string, schema: JsonSchemaDefinition, version: number): void {
    const existing = this.getLatestVersion(topic);
    if (existing !== undefined) {
      const existingSchema = this.get(topic, existing);
      if (existingSchema) {
        checkBackwardCompatible(schema, existingSchema);
      }
    }

    let versions = this.byTopic.get(topic);
    if (!versions) {
      versions = new Map();
      this.byTopic.set(topic, versions);
    }
    versions.set(version, schema);

    const currentLatest = this.latestVersionByTopic.get(topic);
    if (currentLatest === undefined || version > currentLatest) {
      this.latestVersionByTopic.set(topic, version);
    }
  }

  /**
   * Returns the schema definition for a topic and optional version.
   * If version is omitted, returns the latest registered version.
   */
  get(topic: string, version?: number): JsonSchemaDefinition | undefined {
    const versions = this.byTopic.get(topic);
    if (!versions) return undefined;

    const v = version ?? this.latestVersionByTopic.get(topic);
    if (v === undefined) return undefined;

    return versions.get(v);
  }

  /**
   * Returns the latest registered version number for a topic, or undefined if none.
   */
  getLatestVersion(topic: string): number | undefined {
    return this.latestVersionByTopic.get(topic);
  }

  /**
   * Returns the full EventSchema for the latest version of a topic.
   */
  getLatest(topic: string): EventSchema | undefined {
    const version = this.getLatestVersion(topic);
    if (version === undefined) return undefined;
    const schema = this.get(topic, version);
    if (!schema) return undefined;
    return { topic, schema, version };
  }

  /**
   * Returns all registered schemas as an array of { topic, version, schema }.
   * Used by GET /internal/event-schemas (COMP-009.8).
   */
  listAll(): Array<{ topic: string; version: number; schema: JsonSchemaDefinition }> {
    const result: Array<{ topic: string; version: number; schema: JsonSchemaDefinition }> = [];
    for (const [topic, versions] of this.byTopic) {
      for (const [version, schema] of versions) {
        result.push({ topic, version, schema });
      }
    }
    return result;
  }
}
