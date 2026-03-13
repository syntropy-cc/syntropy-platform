/**
 * Event schema type for the schema registry.
 *
 * Architecture: COMP-009.2
 */

/**
 * JSON Schema (draft-07) definition for an event payload.
 * Used by SchemaRegistry to validate event payloads.
 */
export type JsonSchemaDefinition = Record<string, unknown>;

/**
 * Registered event schema: topic, version, and JSON Schema definition.
 * Stored in SchemaRegistry per topic and version.
 */
export interface EventSchema {
  /** Kafka topic (e.g. "identity.events"). */
  topic: string;
  /** JSON Schema draft-07 definition for the event payload. */
  schema: JsonSchemaDefinition;
  /** Schema version; higher = newer. */
  version: number;
}
