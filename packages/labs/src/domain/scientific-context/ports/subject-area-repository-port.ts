/**
 * Port for persisting and querying SubjectArea taxonomy (COMP-022.4).
 */

import type { SubjectArea } from "../subject-area.js";
import type { SubjectAreaId } from "../subject-area.js";

export interface SubjectAreaTreeNode {
  id: SubjectAreaId;
  parentId: SubjectAreaId | null;
  name: string;
  code?: string;
  description?: string;
  depthLevel: number;
  children: SubjectAreaTreeNode[];
}

export interface SubjectAreaRepositoryPort {
  /** Return all subject areas as a flat list (for seeding or tree build). */
  listAll(): Promise<SubjectArea[]>;
  /** Return taxonomy as tree (roots with nested children). */
  getTree(): Promise<SubjectAreaTreeNode[]>;
  findById(id: SubjectAreaId): Promise<SubjectArea | null>;
  save(area: SubjectArea): Promise<void>;
}
