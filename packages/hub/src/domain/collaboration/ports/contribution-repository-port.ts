/**
 * ContributionRepositoryPort — load and save Contribution (COMP-019.5).
 * Architecture: Hub Collaboration Layer; full repository in COMP-019.7.
 */

import type { Contribution } from "../contribution.js";
import type { ContributionId } from "../value-objects/contribution-id.js";

export interface ContributionRepositoryPort {
  getById(id: ContributionId): Promise<Contribution | null>;
  save(contribution: Contribution): Promise<void>;
}
