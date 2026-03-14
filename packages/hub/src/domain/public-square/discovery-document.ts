/**
 * DiscoveryDocument read model — ranked view of institutions for Public Square (COMP-021.1).
 * Updated on dip.governance.* and hub.contribution.* events.
 */

/**
 * Read model for discovery: institution summary with prominence and activity signals.
 */
export interface DiscoveryDocument {
  institutionId: string;
  name: string;
  prominenceScore: number;
  projectCount: number;
  contributorCount: number;
  recentArtifacts: RecentArtifactRef[];
}

export interface RecentArtifactRef {
  artifactId: string;
  at?: string; // ISO timestamp
}

/**
 * Minimal event payload for dip.governance.* (institution created/updated).
 */
export interface DipGovernanceEventPayload {
  type: "institution_created" | "institution_updated";
  institutionId: string;
  name?: string;
}

/**
 * Minimal event payload for hub.contribution.* (contribution integrated).
 */
export interface HubContributionEventPayload {
  type: "contribution_integrated";
  institutionId?: string;
  projectId?: string;
  contributorId?: string;
  artifactId?: string;
}

export type DiscoveryDocumentEventPayload =
  | DipGovernanceEventPayload
  | HubContributionEventPayload;

function isDipGovernancePayload(
  p: DiscoveryDocumentEventPayload
): p is DipGovernanceEventPayload {
  return p.type === "institution_created" || p.type === "institution_updated";
}

function isHubContributionPayload(
  p: DiscoveryDocumentEventPayload
): p is HubContributionEventPayload {
  return p.type === "contribution_integrated";
}

const MAX_RECENT_ARTIFACTS = 10;

/**
 * Creates an empty document for an institution (initial state).
 */
export function createEmptyDocument(
  institutionId: string,
  name: string = ""
): DiscoveryDocument {
  return {
    institutionId,
    name,
    prominenceScore: 0,
    projectCount: 0,
    contributorCount: 0,
    recentArtifacts: [],
  };
}

/**
 * Applies an event to a discovery document (or creates one). Returns the updated document.
 * Idempotent for same event applied twice (e.g. by event type + id).
 */
export function applyDiscoveryEvent(
  current: DiscoveryDocument | null,
  event: DiscoveryDocumentEventPayload
): DiscoveryDocument {
  if (isDipGovernancePayload(event)) {
    const doc = current ?? createEmptyDocument(event.institutionId, event.name ?? "");
    const name = event.name ?? doc.name;
    return { ...doc, name };
  }

  if (isHubContributionPayload(event)) {
    if (!event.institutionId) {
      return current ?? createEmptyDocument("", "");
    }
    const doc =
      current ?? createEmptyDocument(event.institutionId, "");
    const newArtifact =
      event.artifactId != null
        ? { artifactId: event.artifactId, at: new Date().toISOString() }
        : null;
    const recentArtifacts = newArtifact
      ? [newArtifact, ...doc.recentArtifacts].slice(0, MAX_RECENT_ARTIFACTS)
      : doc.recentArtifacts;
    return {
      ...doc,
      institutionId: event.institutionId ?? doc.institutionId,
      recentArtifacts,
    };
  }

  return current ?? createEmptyDocument("", "");
}

/**
 * Updates prominence score on a document (called by ProminenceScorer in COMP-021.2).
 */
export function withProminenceScore(
  doc: DiscoveryDocument,
  prominenceScore: number
): DiscoveryDocument {
  return { ...doc, prominenceScore };
}

/**
 * Updates project count on a document.
 */
export function withProjectCount(
  doc: DiscoveryDocument,
  projectCount: number
): DiscoveryDocument {
  return { ...doc, projectCount };
}
