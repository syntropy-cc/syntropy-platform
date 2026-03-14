/**
 * ContributionSandboxRepositoryPort — load and save ContributionSandbox (COMP-019.7).
 * Architecture: Hub Collaboration Layer
 */

import type { ContributionSandbox } from "../contribution-sandbox.js";

export interface ContributionSandboxRepositoryPort {
  getById(id: string): Promise<ContributionSandbox | null>;
  save(sandbox: ContributionSandbox): Promise<void>;
}
