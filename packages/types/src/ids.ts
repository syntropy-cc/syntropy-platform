/**
 * Learn-domain branded IDs (COMP-015.1).
 * Architecture: COMP-015 Learn Content Hierarchy.
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createUuidBrand<K extends string>(
  value: string,
  _brand: K,
  name: string
): string & { readonly __brand: K } {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Invalid ${name}: value cannot be empty`);
  }
  if (!UUID_REGEX.test(trimmed)) {
    throw new Error(`Invalid ${name}: expected UUID format, got "${value}"`);
  }
  return trimmed as string & { readonly __brand: K };
}

function isUuidBrand(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

/** Branded type for CareerId. UUID-based; immutable. */
export type CareerId = string & { readonly __brand: "CareerId" };

export function createCareerId(value: string): CareerId {
  return createUuidBrand(value, "CareerId", "CareerId");
}

export function isCareerId(value: string): value is CareerId {
  return isUuidBrand(value);
}

/** Branded type for TrackId. UUID-based; immutable. */
export type TrackId = string & { readonly __brand: "TrackId" };

export function createTrackId(value: string): TrackId {
  return createUuidBrand(value, "TrackId", "TrackId");
}

export function isTrackId(value: string): value is TrackId {
  return isUuidBrand(value);
}

/** Branded type for CourseId. UUID-based; immutable. */
export type CourseId = string & { readonly __brand: "CourseId" };

export function createCourseId(value: string): CourseId {
  return createUuidBrand(value, "CourseId", "CourseId");
}

export function isCourseId(value: string): value is CourseId {
  return isUuidBrand(value);
}

/** Branded type for FragmentId. UUID-based; immutable. */
export type FragmentId = string & { readonly __brand: "FragmentId" };

export function createFragmentId(value: string): FragmentId {
  return createUuidBrand(value, "FragmentId", "FragmentId");
}

export function isFragmentId(value: string): value is FragmentId {
  return isUuidBrand(value);
}

/** Branded type for CreatorWorkflowId. UUID-based; immutable. (COMP-017.1) */
export type CreatorWorkflowId = string & { readonly __brand: "CreatorWorkflowId" };

export function createCreatorWorkflowId(value: string): CreatorWorkflowId {
  return createUuidBrand(value, "CreatorWorkflowId", "CreatorWorkflowId");
}

export function isCreatorWorkflowId(value: string): value is CreatorWorkflowId {
  return isUuidBrand(value);
}

/** Branded type for ApprovalRecordId. UUID-based; immutable. (COMP-017.3) */
export type ApprovalRecordId = string & { readonly __brand: "ApprovalRecordId" };

export function createApprovalRecordId(value: string): ApprovalRecordId {
  return createUuidBrand(value, "ApprovalRecordId", "ApprovalRecordId");
}

export function isApprovalRecordId(value: string): value is ApprovalRecordId {
  return isUuidBrand(value);
}
