/**
 * IssueRepositoryPort — load and save Issue (COMP-019.5).
 * Architecture: Hub Collaboration Layer; full repository in COMP-019.7.
 */

import type { Issue } from "../issue.js";
import type { IssueId } from "../value-objects/issue-id.js";

export interface IssueRepositoryPort {
  getById(id: IssueId): Promise<Issue | null>;
  getByIds(ids: string[]): Promise<Issue[]>;
  save(issue: Issue): Promise<void>;
}
