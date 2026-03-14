/**
 * SubjectArea entity — hierarchical taxonomy (domain → field → subfield) (COMP-022.1).
 * Architecture: scientific-context-extension.md
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Branded type for SubjectAreaId. UUID-based; immutable. */
export type SubjectAreaId = string & { readonly __brand: "SubjectAreaId" };

export function createSubjectAreaId(value: string): SubjectAreaId {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("SubjectAreaId cannot be empty");
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid SubjectAreaId: expected UUID format, got "${value}"`);
  }
  return trimmed as SubjectAreaId;
}

export function isSubjectAreaId(value: string): value is SubjectAreaId {
  return UUID_REGEX.test(value.trim());
}

/** Depth level in hierarchy: 1 = domain, 2 = field, 3 = subfield. */
export type SubjectAreaLevel = 1 | 2 | 3;

export interface SubjectAreaParams {
  id: SubjectAreaId;
  parentId: SubjectAreaId | null;
  name: string;
  code?: string;
  description?: string;
  depthLevel: SubjectAreaLevel;
}

/**
 * SubjectArea value object — one node in the scientific domain taxonomy.
 * Hierarchy: domain (root) → field → subfield.
 */
export class SubjectArea {
  readonly id: SubjectAreaId;
  readonly parentId: SubjectAreaId | null;
  readonly name: string;
  readonly code: string | undefined;
  readonly description: string | undefined;
  readonly depthLevel: SubjectAreaLevel;

  constructor(params: SubjectAreaParams) {
    if (!params.name?.trim()) {
      throw new Error("SubjectArea name cannot be empty");
    }
    if (params.depthLevel < 1 || params.depthLevel > 3) {
      throw new Error("SubjectArea depthLevel must be 1, 2, or 3");
    }
    if (params.depthLevel === 1 && params.parentId !== null) {
      throw new Error("Domain-level SubjectArea must have parentId null");
    }
    if (params.depthLevel > 1 && params.parentId === null) {
      throw new Error("Field and subfield SubjectAreas must have a parentId");
    }
    this.id = params.id;
    this.parentId = params.parentId;
    this.name = params.name.trim();
    this.code = params.code?.trim();
    this.description = params.description?.trim();
    this.depthLevel = params.depthLevel;
  }

  /** True if this is a root (domain) node. */
  get isRoot(): boolean {
    return this.parentId === null;
  }
}
