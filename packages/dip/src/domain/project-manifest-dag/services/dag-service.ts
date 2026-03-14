/**
 * DAGService — enforces acyclicity and provides topological order and roots.
 * Architecture: COMP-006, DIP Project Manifest & DAG
 */

import { CyclicDependencyError } from "../errors.js";

/**
 * Service for managing a directed acyclic graph (DAG).
 * addEdge throws CyclicDependencyError when adding an edge would create a cycle.
 */
export class DAGService {
  /** Adjacency list: node -> set of outgoing neighbors */
  private readonly outgoing: Map<string, Set<string>> = new Map();
  /** Reverse: node -> set of incoming neighbors (for findRoots) */
  private readonly incoming: Map<string, Set<string>> = new Map();

  /**
   * Adds a directed edge from -> to. Throws CyclicDependencyError if that would create a cycle.
   * Before adding, runs DFS from `to`: if `from` is reachable, adding from->to would create a cycle.
   */
  addEdge(from: string, to: string): void {
    if (from === to) {
      throw new CyclicDependencyError(from, to, "Self-loop is not allowed");
    }

    if (this.wouldCreateCycle(from, to)) {
      throw new CyclicDependencyError(from, to);
    }

    if (!this.outgoing.has(from)) this.outgoing.set(from, new Set());
    this.outgoing.get(from)!.add(to);

    if (!this.incoming.has(to)) this.incoming.set(to, new Set());
    this.incoming.get(to)!.add(from);

    if (!this.outgoing.has(to)) this.outgoing.set(to, new Set());
    if (!this.incoming.has(from)) this.incoming.set(from, new Set());
  }

  /**
   * Returns true if adding from->to would create a cycle (i.e. to can reach from).
   */
  private wouldCreateCycle(from: string, to: string): boolean {
    const visited = new Set<string>();
    const stack: string[] = [to];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node === from) return true;
      if (visited.has(node)) continue;
      visited.add(node);
      const neighbors = this.outgoing.get(node);
      if (neighbors) {
        for (const n of neighbors) {
          stack.push(n);
        }
      }
    }
    return false;
  }

  /**
   * Returns a valid topological order (all edges go from earlier to later in the list).
   * Uses Kahn's algorithm (in-degree based).
   */
  getTopologicalOrder(): string[] {
    const inDegree = new Map<string, number>();
    for (const [node, set] of this.incoming) {
      inDegree.set(node, set.size);
    }
    for (const node of this.outgoing.keys()) {
      if (!inDegree.has(node)) inDegree.set(node, 0);
    }

    const queue: string[] = [];
    for (const [node, deg] of inDegree) {
      if (deg === 0) queue.push(node);
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);
      const neighbors = this.outgoing.get(u);
      if (neighbors) {
        for (const v of neighbors) {
          const d = inDegree.get(v)! - 1;
          inDegree.set(v, d);
          if (d === 0) queue.push(v);
        }
      }
    }

    return order;
  }

  /**
   * Returns nodes with no incoming edges (roots of the DAG).
   */
  findRoots(): string[] {
    const roots: string[] = [];
    const allNodes = new Set<string>();
    for (const k of this.outgoing.keys()) allNodes.add(k);
    for (const k of this.incoming.keys()) allNodes.add(k);
    for (const node of allNodes) {
      const inc = this.incoming.get(node);
      if (!inc || inc.size === 0) roots.push(node);
    }
    return roots;
  }

  /**
   * Returns all nodes (for tests / inspection).
   */
  getNodes(): string[] {
    const set = new Set<string>();
    for (const k of this.outgoing.keys()) set.add(k);
    for (const k of this.incoming.keys()) set.add(k);
    return [...set];
  }
}
