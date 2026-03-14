/**
 * PostgreSQL implementation of SubjectAreaRepositoryPort (COMP-022.4).
 */

import {
  SubjectArea,
  createSubjectAreaId,
  type SubjectAreaId,
  type SubjectAreaLevel,
} from "../../domain/scientific-context/subject-area.js";
import type {
  SubjectAreaRepositoryPort,
  SubjectAreaTreeNode,
} from "../../domain/scientific-context/ports/subject-area-repository-port.js";
import type { LabsDbClient } from "../labs-db-client.js";

const TABLE = "labs.subject_areas";

const SELECT_ALL = `SELECT id, parent_id, name, code, description, depth_level FROM ${TABLE} ORDER BY depth_level, name`;
const SELECT_BY_ID = `SELECT id, parent_id, name, code, description, depth_level FROM ${TABLE} WHERE id = $1`;
const INSERT = `INSERT INTO ${TABLE} (id, parent_id, name, code, description, depth_level) VALUES ($1, $2, $3, $4, $5, $6)`;

interface SubjectAreaRow {
  id: string;
  parent_id: string | null;
  name: string;
  code: string | null;
  description: string | null;
  depth_level: number;
}

function rowToSubjectArea(row: SubjectAreaRow): SubjectArea {
  return new SubjectArea({
    id: createSubjectAreaId(row.id),
    parentId: row.parent_id ? createSubjectAreaId(row.parent_id) : null,
    name: row.name,
    code: row.code ?? undefined,
    description: row.description ?? undefined,
    depthLevel: row.depth_level as SubjectAreaLevel,
  });
}

function buildTree(areas: SubjectArea[]): SubjectAreaTreeNode[] {
  const byId = new Map<string, SubjectAreaTreeNode>();
  for (const a of areas) {
    byId.set(a.id as string, {
      id: a.id,
      parentId: a.parentId,
      name: a.name,
      code: a.code,
      description: a.description,
      depthLevel: a.depthLevel,
      children: [],
    });
  }
  const roots: SubjectAreaTreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = byId.get(node.parentId as string);
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
  }
  roots.sort((a, b) => a.name.localeCompare(b.name));
  for (const r of roots) {
    r.children.sort((a, b) => a.name.localeCompare(b.name));
  }
  return roots;
}

export class PostgresSubjectAreaRepository implements SubjectAreaRepositoryPort {
  constructor(private readonly client: LabsDbClient) {}

  async listAll(): Promise<SubjectArea[]> {
    const rows = await this.client.query<SubjectAreaRow>(SELECT_ALL, []);
    return rows.map(rowToSubjectArea);
  }

  async getTree(): Promise<SubjectAreaTreeNode[]> {
    const areas = await this.listAll();
    return buildTree(areas);
  }

  async findById(id: SubjectAreaId): Promise<SubjectArea | null> {
    const rows = await this.client.query<SubjectAreaRow>(SELECT_BY_ID, [
      id as string,
    ]);
    if (rows.length === 0) return null;
    return rowToSubjectArea(rows[0]!);
  }

  async save(area: SubjectArea): Promise<void> {
    await this.client.execute(INSERT, [
      area.id as string,
      area.parentId as string | null,
      area.name,
      area.code ?? null,
      area.description ?? null,
      area.depthLevel,
    ]);
  }
}
