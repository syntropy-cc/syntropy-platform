/**
 * Creator workflow phase enum and ordering (COMP-017.1).
 * Architecture: creator-tools-copilot.md, IMPLEMENTATION-PLAN Section 7.
 */

/** Ordered phases for the 5-phase creator workflow. */
export const CREATOR_WORKFLOW_PHASES = [
  "ideation",
  "drafting",
  "review",
  "refinement",
  "publication",
] as const;

export type CreatorWorkflowPhase = (typeof CREATOR_WORKFLOW_PHASES)[number];

const PHASE_INDEX = new Map<CreatorWorkflowPhase, number>(
  CREATOR_WORKFLOW_PHASES.map((p, i) => [p, i])
);

/**
 * Returns the next phase in order, or null if phase is the last.
 */
export function getNextPhase(
  phase: CreatorWorkflowPhase
): CreatorWorkflowPhase | null {
  const i = PHASE_INDEX.get(phase);
  if (i === undefined || i === CREATOR_WORKFLOW_PHASES.length - 1) {
    return null;
  }
  return CREATOR_WORKFLOW_PHASES[i + 1] ?? null;
}

/**
 * Returns true if nextPhase is the immediate successor of currentPhase.
 */
export function isValidNextPhase(
  currentPhase: CreatorWorkflowPhase,
  nextPhase: CreatorWorkflowPhase
): boolean {
  const next = getNextPhase(currentPhase);
  return next === nextPhase;
}

export function isCreatorWorkflowPhase(value: string): value is CreatorWorkflowPhase {
  return CREATOR_WORKFLOW_PHASES.includes(value as CreatorWorkflowPhase);
}
