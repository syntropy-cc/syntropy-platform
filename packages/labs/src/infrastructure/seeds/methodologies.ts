/**
 * Research methodology seed data — standard types (COMP-022.2).
 */

import type { ResearchMethodologyParams } from "../../domain/scientific-context/research-methodology.js";
import { createResearchMethodologyId } from "../../domain/scientific-context/research-methodology.js";

/** Fixed UUIDs for seed methodologies. */
const ID = {
  QUANTITATIVE: "b2000001-0000-4000-8000-000000000001",
  QUALITATIVE: "b2000001-0000-4000-8000-000000000002",
  MIXED: "b2000001-0000-4000-8000-000000000003",
} as const;

export const METHODOLOGY_SEED: ResearchMethodologyParams[] = [
  {
    id: createResearchMethodologyId(ID.QUANTITATIVE),
    name: "Quantitative",
    type: "quantitative",
    description:
      "Numeric data and statistical analysis; experiments, surveys, measurements.",
  },
  {
    id: createResearchMethodologyId(ID.QUALITATIVE),
    name: "Qualitative",
    type: "qualitative",
    description:
      "Non-numeric data; interviews, case studies, thematic analysis.",
  },
  {
    id: createResearchMethodologyId(ID.MIXED),
    name: "Mixed methods",
    type: "mixed",
    description: "Combination of quantitative and qualitative approaches.",
  },
];
