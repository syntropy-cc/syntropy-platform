/**
 * Schema registry and compatibility for event bus.
 *
 * Architecture: COMP-009.2
 */

export type { EventSchema, JsonSchemaDefinition } from "./EventSchema.js";
export { SchemaRegistry } from "./SchemaRegistry.js";
export {
  checkBackwardCompatible,
  IncompatibleSchemaError,
} from "./compatibility.js";
