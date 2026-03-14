/**
 * Port for persisting Fragment aggregate (COMP-016.5).
 * Architecture: fragment-artifact-engine.md, PAT-004.
 */

import type { FragmentId } from "@syntropy/types";

import type { Fragment } from "../fragment.js";

export interface FragmentRepositoryPort {
  findById(id: FragmentId): Promise<Fragment | null>;

  save(fragment: Fragment): Promise<void>;
}
