/**
 * DIP context passed into the API for artifact routes (COMP-003.7).
 * Kept in types to avoid circular dependency between server and routes.
 */

import type { ArtifactLifecycleService, ArtifactRepository } from "@syntropy/dip";

export interface DipContext {
  lifecycleService: ArtifactLifecycleService;
  artifactRepository: ArtifactRepository;
}
