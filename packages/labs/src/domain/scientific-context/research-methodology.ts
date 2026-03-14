/**
 * ResearchMethodology entity — methodology type catalog (COMP-022.2).
 * Architecture: scientific-context-extension.md
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Branded type for ResearchMethodologyId. UUID-based; immutable. */
export type ResearchMethodologyId =
  string & { readonly __brand: "ResearchMethodologyId" };

export function createResearchMethodologyId(
  value: string
): ResearchMethodologyId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("ResearchMethodologyId cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid ResearchMethodologyId: expected UUID format, got "${value}"`
    );
  }
  return trimmed as ResearchMethodologyId;
}

export function isResearchMethodologyId(
  value: string
): value is ResearchMethodologyId {
  return UUID_REGEX.test(value.trim());
}

/** Methodology type: quantitative, qualitative, or mixed. */
export type MethodologyType = "quantitative" | "qualitative" | "mixed";

const METHODOLOGY_TYPES: MethodologyType[] = [
  "quantitative",
  "qualitative",
  "mixed",
];

export function isMethodologyType(value: string): value is MethodologyType {
  return METHODOLOGY_TYPES.includes(value as MethodologyType);
}

export interface ResearchMethodologyParams {
  id: ResearchMethodologyId;
  name: string;
  type: MethodologyType;
  description?: string;
}

/**
 * ResearchMethodology entity — one methodology definition in the catalog.
 */
export class ResearchMethodology {
  readonly id: ResearchMethodologyId;
  readonly name: string;
  readonly type: MethodologyType;
  readonly description: string | undefined;

  constructor(params: ResearchMethodologyParams) {
    if (!params.name?.trim()) {
      throw new Error("ResearchMethodology name cannot be empty");
    }
    if (!isMethodologyType(params.type)) {
      throw new Error(
        `Invalid methodology type: ${params.type}. Must be quantitative, qualitative, or mixed.`
      );
    }
    this.id = params.id;
    this.name = params.name.trim();
    this.type = params.type;
    this.description = params.description?.trim();
  }
}
