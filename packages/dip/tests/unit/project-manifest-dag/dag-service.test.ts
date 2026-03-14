/**
 * Unit tests for DAGService (acyclicity enforcement).
 * Tests for: COMP-006.3
 */

import { describe, expect, it } from "vitest";
import { CyclicDependencyError } from "../../../src/domain/project-manifest-dag/errors.js";
import { DAGService } from "../../../src/domain/project-manifest-dag/services/dag-service.js";

describe("DAGService.addEdge", () => {
  it("allows adding edges that form a DAG", () => {
    const dag = new DAGService();
    dag.addEdge("a", "b");
    dag.addEdge("b", "c");
    dag.addEdge("a", "c");
    expect(dag.getNodes().sort()).toEqual(["a", "b", "c"]);
  });

  it("throws CyclicDependencyError for direct self-loop", () => {
    const dag = new DAGService();
    expect(() => dag.addEdge("a", "a")).toThrow(CyclicDependencyError);
    expect(() => dag.addEdge("a", "a")).toThrow(/cycle|self-loop/i);
  });

  it("throws CyclicDependencyError when adding edge would create direct cycle", () => {
    const dag = new DAGService();
    dag.addEdge("a", "b");
    expect(() => dag.addEdge("b", "a")).toThrow(CyclicDependencyError);
    try {
      dag.addEdge("b", "a");
    } catch (e) {
      expect(e).toBeInstanceOf(CyclicDependencyError);
      expect((e as CyclicDependencyError).from).toBe("b");
      expect((e as CyclicDependencyError).to).toBe("a");
    }
  });

  it("throws CyclicDependencyError when adding edge would create indirect cycle", () => {
    const dag = new DAGService();
    dag.addEdge("a", "b");
    dag.addEdge("b", "c");
    dag.addEdge("c", "d");
    expect(() => dag.addEdge("d", "a")).toThrow(CyclicDependencyError);
  });

  it("allows diamond graph (multiple paths to same node)", () => {
    const dag = new DAGService();
    dag.addEdge("a", "b");
    dag.addEdge("a", "c");
    dag.addEdge("b", "d");
    dag.addEdge("c", "d");
    const order = dag.getTopologicalOrder();
    expect(order).toContain("a");
    expect(order).toContain("b");
    expect(order).toContain("c");
    expect(order).toContain("d");
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("c"));
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("d"));
    expect(order.indexOf("c")).toBeLessThan(order.indexOf("d"));
  });
});

describe("DAGService.getTopologicalOrder", () => {
  it("returns valid topological order for linear DAG", () => {
    const dag = new DAGService();
    dag.addEdge("1", "2");
    dag.addEdge("2", "3");
    dag.addEdge("3", "4");
    const order = dag.getTopologicalOrder();
    expect(order).toEqual(["1", "2", "3", "4"]);
  });

  it("returns all nodes in valid order for branching DAG", () => {
    const dag = new DAGService();
    dag.addEdge("root", "a");
    dag.addEdge("root", "b");
    dag.addEdge("a", "c");
    const order = dag.getTopologicalOrder();
    expect(order).toContain("root");
    expect(order).toContain("a");
    expect(order).toContain("b");
    expect(order).toContain("c");
    expect(order.indexOf("root")).toBeLessThan(order.indexOf("a"));
    expect(order.indexOf("root")).toBeLessThan(order.indexOf("b"));
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("c"));
  });

  it("returns empty array for empty graph", () => {
    const dag = new DAGService();
    expect(dag.getTopologicalOrder()).toEqual([]);
  });
});

describe("DAGService.findRoots", () => {
  it("returns nodes with no incoming edges", () => {
    const dag = new DAGService();
    dag.addEdge("r1", "a");
    dag.addEdge("r2", "a");
    dag.addEdge("a", "b");
    const roots = dag.findRoots();
    expect(roots.sort()).toEqual(["r1", "r2"]);
  });

  it("returns single root for linear DAG", () => {
    const dag = new DAGService();
    dag.addEdge("a", "b");
    dag.addEdge("b", "c");
    expect(dag.findRoots()).toEqual(["a"]);
  });

  it("returns empty array for empty graph", () => {
    const dag = new DAGService();
    expect(dag.findRoots()).toEqual([]);
  });

  it("returns all nodes when there are no edges", () => {
    const dag = new DAGService();
    dag.addEdge("x", "y");
    dag.addEdge("a", "b");
    const rootsBefore = dag.findRoots();
    expect(rootsBefore.sort()).toEqual(["a", "x"]);
  });
});
