/**
 * Domain errors for Project Manifest & DAG.
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

/**
 * Thrown when adding an edge would create a cycle in the DAG.
 */
export class CyclicDependencyError extends Error {
  readonly from: string;
  readonly to: string;

  constructor(from: string, to: string, message?: string) {
    super(
      message ?? `Adding edge ${from} -> ${to} would create a cycle in the DAG`
    );
    this.name = "CyclicDependencyError";
    this.from = from;
    this.to = to;
    Object.setPrototypeOf(this, CyclicDependencyError.prototype);
  }
}
