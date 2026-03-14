/**
 * Subject area seed data — ACM CCS–inspired taxonomy (COMP-022.1).
 * Hierarchy: domain (1) → field (2) → subfield (3).
 */

import type { SubjectAreaParams } from "../../domain/scientific-context/subject-area.js";
import { createSubjectAreaId } from "../../domain/scientific-context/subject-area.js";

/** Fixed UUIDs for seed data so tree is stable and testable. */
const ID = {
  COMPUTING_METHODOLOGIES: "a1000001-0000-4000-8000-000000000001",
  ARTIFICIAL_INTELLIGENCE: "a1000001-0000-4000-8000-000000000002",
  MACHINE_LEARNING: "a1000001-0000-4000-8000-000000000003",
  COMPUTER_VISION: "a1000001-0000-4000-8000-000000000004",
  NLP: "a1000001-0000-4000-8000-000000000005",
  SOFTWARE_ENGINEERING: "a1000001-0000-4000-8000-000000000006",
  SOFTWARE_ORGANIZATION: "a1000001-0000-4000-8000-000000000007",
  SOFTWARE_DESIGN: "a1000001-0000-4000-8000-000000000008",
  SOFTWARE_TESTING: "a1000001-0000-4000-8000-000000000009",
  INFORMATION_SYSTEMS: "a1000001-0000-4000-8000-00000000000a",
  DATABASES: "a1000001-0000-4000-8000-00000000000b",
  INFO_RETRIEVAL: "a1000001-0000-4000-8000-00000000000c",
  THEORY_OF_COMPUTATION: "a1000001-0000-4000-8000-00000000000d",
  ALGORITHMS: "a1000001-0000-4000-8000-00000000000e",
  COMPLEXITY_THEORY: "a1000001-0000-4000-8000-00000000000f",
  NATURAL_SCIENCES: "a1000001-0000-4000-8000-000000000010",
  BIOLOGY: "a1000001-0000-4000-8000-000000000011",
  MOLECULAR_BIOLOGY: "a1000001-0000-4000-8000-000000000012",
  ECOLOGY: "a1000001-0000-4000-8000-000000000013",
  MATHEMATICS: "a1000001-0000-4000-8000-000000000014",
  APPLIED_MATH: "a1000001-0000-4000-8000-000000000015",
  STATISTICS: "a1000001-0000-4000-8000-000000000016",
} as const;

function p(id: string, parentId: string | null, name: string, depth: 1 | 2 | 3, code?: string, description?: string): SubjectAreaParams {
  return {
    id: createSubjectAreaId(id),
    parentId: parentId ? createSubjectAreaId(parentId) : null,
    name,
    code,
    description,
    depthLevel: depth,
  };
}

/**
 * Flat list of subject areas (ACM CCS–inspired). Order: roots first, then children.
 * Use buildSubjectAreaTree() to get a tree structure.
 */
export const SUBJECT_AREA_SEED: SubjectAreaParams[] = [
  p(ID.COMPUTING_METHODOLOGIES, null, "Computing methodologies", 1, "ccs.computing-methodologies", "General computation and processing"),
  p(ID.ARTIFICIAL_INTELLIGENCE, ID.COMPUTING_METHODOLOGIES, "Artificial intelligence", 2, "ccs.computing-methodologies.ai", "AI and related fields"),
  p(ID.MACHINE_LEARNING, ID.ARTIFICIAL_INTELLIGENCE, "Machine learning", 3, "ccs.ml", "Supervised and unsupervised learning"),
  p(ID.COMPUTER_VISION, ID.ARTIFICIAL_INTELLIGENCE, "Computer vision", 3, "ccs.vision", "Image and video understanding"),
  p(ID.NLP, ID.ARTIFICIAL_INTELLIGENCE, "Natural language processing", 3, "ccs.nlp", "Language and text processing"),
  p(ID.SOFTWARE_ENGINEERING, null, "Software and its engineering", 1, "ccs.software", "Software design and development"),
  p(ID.SOFTWARE_ORGANIZATION, ID.SOFTWARE_ENGINEERING, "Software organization and properties", 2, "ccs.software.organization", "Structure and quality"),
  p(ID.SOFTWARE_DESIGN, ID.SOFTWARE_ORGANIZATION, "Software design", 3, "ccs.software.design", "Design patterns and architecture"),
  p(ID.SOFTWARE_TESTING, ID.SOFTWARE_ORGANIZATION, "Software testing", 3, "ccs.software.testing", "Testing and verification"),
  p(ID.INFORMATION_SYSTEMS, null, "Information systems", 1, "ccs.information-systems", "Data and information management"),
  p(ID.DATABASES, ID.INFORMATION_SYSTEMS, "Databases", 2, "ccs.databases", "Database systems and theory"),
  p(ID.INFO_RETRIEVAL, ID.INFORMATION_SYSTEMS, "Information retrieval", 2, "ccs.ir", "Search and retrieval"),
  p(ID.THEORY_OF_COMPUTATION, null, "Theory of computation", 1, "ccs.theory", "Formal models and complexity"),
  p(ID.ALGORITHMS, ID.THEORY_OF_COMPUTATION, "Design and analysis of algorithms", 2, "ccs.theory.algorithms", "Algorithms and complexity"),
  p(ID.COMPLEXITY_THEORY, ID.THEORY_OF_COMPUTATION, "Complexity theory", 2, "ccs.theory.complexity", "Computational complexity"),
  p(ID.NATURAL_SCIENCES, null, "Natural sciences", 1, "ns.natural", "Biology, chemistry, physics"),
  p(ID.BIOLOGY, ID.NATURAL_SCIENCES, "Biology", 2, "ns.biology", "Biological sciences"),
  p(ID.MOLECULAR_BIOLOGY, ID.BIOLOGY, "Molecular biology", 3, "ns.biology.molecular", "Molecular and cellular"),
  p(ID.ECOLOGY, ID.BIOLOGY, "Ecology", 3, "ns.biology.ecology", "Ecosystems and environment"),
  p(ID.MATHEMATICS, null, "Mathematics", 1, "math", "Pure and applied mathematics"),
  p(ID.APPLIED_MATH, ID.MATHEMATICS, "Applied mathematics", 2, "math.applied", "Applications of mathematics"),
  p(ID.STATISTICS, ID.APPLIED_MATH, "Statistics", 3, "math.statistics", "Statistical methods"),
];

export interface SubjectAreaTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  description?: string;
  depthLevel: number;
  children: SubjectAreaTreeNode[];
}

/** Build a tree from the flat seed list (roots have no parent). */
export function buildSubjectAreaTree(flat: SubjectAreaParams[]): SubjectAreaTreeNode[] {
  const byId = new Map<string, SubjectAreaTreeNode>();
  for (const a of flat) {
    byId.set(a.id as string, {
      id: a.id as string,
      parentId: a.parentId as string | null,
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
      const parent = byId.get(node.parentId);
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
