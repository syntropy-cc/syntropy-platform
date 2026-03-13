/**
 * ArtifactStatus — lifecycle status of a DIP Artifact.
 * Architecture: COMP-003, DIP Artifact Registry
 */

export const ArtifactStatus = {
  Draft: "draft",
  Submitted: "submitted",
  Published: "published",
  Archived: "archived",
} as const;

export type ArtifactStatus = (typeof ArtifactStatus)[keyof typeof ArtifactStatus];

export function isArtifactStatus(value: string): value is ArtifactStatus {
  return (
    value === ArtifactStatus.Draft ||
    value === ArtifactStatus.Submitted ||
    value === ArtifactStatus.Published ||
    value === ArtifactStatus.Archived
  );
}
