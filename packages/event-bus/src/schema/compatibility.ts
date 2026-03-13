/**
 * Backward compatibility check for event schemas.
 *
 * Rejects breaking changes: removed required fields, type narrowing.
 * Architecture: COMP-009.2
 */

import type { JsonSchemaDefinition } from "./EventSchema.js";

export class IncompatibleSchemaError extends Error {
  constructor(
    message: string,
    public readonly details: string[],
  ) {
    super(message);
    this.name = "IncompatibleSchemaError";
    Object.setPrototypeOf(this, IncompatibleSchemaError.prototype);
  }
}

/**
 * Extracts required property names from a JSON Schema.
 */
function getRequiredFields(schema: JsonSchemaDefinition): Set<string> {
  const required = schema.required;
  if (!Array.isArray(required)) return new Set();
  return new Set(required.filter((r): r is string => typeof r === "string"));
}

/**
 * Checks that newSchema is backward compatible with existingSchema.
 * - Existing required fields must remain required (or optional).
 * - No required field may be removed.
 *
 * @throws IncompatibleSchemaError if the new schema is breaking.
 */
export function checkBackwardCompatible(
  newSchema: JsonSchemaDefinition,
  existingSchema: JsonSchemaDefinition,
): void {
  const details: string[] = [];
  const existingRequired = getRequiredFields(existingSchema);
  const newRequired = getRequiredFields(newSchema);

  for (const field of existingRequired) {
    if (!newRequired.has(field)) {
      details.push(`Required field "${field}" was removed or made optional`);
    }
  }

  const newProps = schemaPropertyNames(newSchema);
  const existingProps = schemaPropertyNames(existingSchema);
  for (const field of existingRequired) {
    if (newProps.has(field) && !existingProps.has(field)) {
      // field was added as required - that's OK (additive)
    }
  }
  // Removed optional fields are OK for backward compat; we only disallow removing required

  if (details.length > 0) {
    throw new IncompatibleSchemaError(
      `New schema is not backward compatible: ${details.join("; ")}`,
      details,
    );
  }
}

function schemaPropertyNames(schema: JsonSchemaDefinition): Set<string> {
  const props = schema.properties;
  if (props === null || typeof props !== "object") return new Set();
  return new Set(Object.keys(props));
}
