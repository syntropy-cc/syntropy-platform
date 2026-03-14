/**
 * Sprint repository port (COMP-029.5).
 * Architecture: Planning domain, PAT-004
 */

import type { Sprint } from "../sprint.js";

export interface SprintRepository {
  save(sprint: Sprint): Promise<void>;
  findById(id: string): Promise<Sprint | null>;
}
