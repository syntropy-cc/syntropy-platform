/**
 * ExperimentStatus — lifecycle status for ExperimentDesign (COMP-024.1).
 * Architecture: experiment-design.md
 */

/** Lifecycle status for an experiment design. */
export type ExperimentStatus =
  | "designing"
  | "registered"
  | "running"
  | "completed";

const EXPERIMENT_STATUSES: ExperimentStatus[] = [
  "designing",
  "registered",
  "running",
  "completed",
];

export function isExperimentStatus(
  value: string
): value is ExperimentStatus {
  return EXPERIMENT_STATUSES.includes(value as ExperimentStatus);
}
