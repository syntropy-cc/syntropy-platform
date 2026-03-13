/**
 * ArtifactType value object — DIP artifact classification (COMP-003.6).
 * Architecture: COMP-003, DIP Artifact Registry
 */

export const ArtifactType = {
  ScientificArticle: "scientific-article",
  Dataset: "dataset",
  Experiment: "experiment",
  Code: "code",
  Document: "document",
} as const;

export type ArtifactType = (typeof ArtifactType)[keyof typeof ArtifactType];

const VALID_TYPES = new Set<string>(Object.values(ArtifactType));

/**
 * Creates a validated ArtifactType from a string.
 *
 * @param value - Raw string (e.g. from API or DB)
 * @returns The ArtifactType if valid
 * @throws Error if value is not a valid ArtifactType
 */
export function createArtifactType(value: string): ArtifactType {
  if (!VALID_TYPES.has(value)) {
    throw new Error(
      `Invalid artifact type: ${value}. Must be one of: ${[...VALID_TYPES].join(", ")}`,
    );
  }
  return value as ArtifactType;
}

/**
 * Returns true if the string is a valid ArtifactType.
 */
export function isArtifactType(value: string): value is ArtifactType {
  return VALID_TYPES.has(value);
}
