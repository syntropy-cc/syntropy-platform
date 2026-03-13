/**
 * DIP (Digital Institutions Protocol) package.
 * Architecture: COMP-003 through COMP-008
 */

export {
  Artifact,
  ArtifactStatus,
  createArtifactId,
  createAuthorId,
  createContentHash,
  isArtifactId,
  isArtifactStatus,
  isAuthorId,
  isContentHash,
} from "./domain/index.js";
export type { ArtifactId, AuthorId, ContentHash } from "./domain/index.js";
