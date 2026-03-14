/**
 * Unit tests for Sprint entity (COMP-029.2).
 */

import { describe, it, expect } from "vitest";
import { Sprint, SprintTaskDateOutOfRangeError } from "../../src/domain/sprint.js";

describe("Sprint entity (COMP-029.2)", () => {
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-01-14");

  it("create builds sprint with empty task list", () => {
    const sprint = Sprint.create({
      id: "s1",
      startDate,
      endDate,
    });
    expect(sprint.id).toBe("s1");
    expect(sprint.startDate).toBe(startDate);
    expect(sprint.endDate).toBe(endDate);
    expect(sprint.taskIds).toEqual([]);
  });

  it("create throws when startDate >= endDate", () => {
    expect(() =>
      Sprint.create({
        id: "s1",
        startDate: endDate,
        endDate: startDate,
      })
    ).toThrow("Sprint.startDate must be before endDate");
    expect(() =>
      Sprint.create({
        id: "s1",
        startDate,
        endDate: startDate,
      })
    ).toThrow("Sprint.startDate must be before endDate");
  });

  it("create throws when id is empty", () => {
    expect(() =>
      Sprint.create({ id: "", startDate, endDate })
    ).toThrow("Sprint.id cannot be empty");
  });

  it("addTask appends task when no due date", () => {
    const sprint = Sprint.create({ id: "s1", startDate, endDate });
    const withTask = sprint.addTask("t1");
    expect(withTask.taskIds).toEqual(["t1"]);
    const withSecond = withTask.addTask("t2");
    expect(withSecond.taskIds).toEqual(["t1", "t2"]);
  });

  it("addTask accepts task when due date within sprint range", () => {
    const sprint = Sprint.create({ id: "s1", startDate, endDate });
    const dueInRange = new Date("2025-01-07");
    const withTask = sprint.addTask("t1", dueInRange);
    expect(withTask.taskIds).toEqual(["t1"]);
  });

  it("addTask throws when due date before sprint start", () => {
    const sprint = Sprint.create({ id: "s1", startDate, endDate });
    const beforeStart = new Date("2024-12-31");
    expect(() => sprint.addTask("t1", beforeStart)).toThrow(
      SprintTaskDateOutOfRangeError
    );
    expect(() => sprint.addTask("t1", beforeStart)).toThrow(/outside sprint/);
  });

  it("addTask throws when due date after sprint end", () => {
    const sprint = Sprint.create({ id: "s1", startDate, endDate });
    const afterEnd = new Date("2025-01-15");
    expect(() => sprint.addTask("t1", afterEnd)).toThrow(
      SprintTaskDateOutOfRangeError
    );
  });

  it("addTask is idempotent when task already in sprint", () => {
    const sprint = Sprint.create({ id: "s1", startDate, endDate }).addTask(
      "t1"
    );
    const same = sprint.addTask("t1");
    expect(same.taskIds).toEqual(["t1"]);
  });

  it("fromPersistence reconstructs sprint with task ids", () => {
    const sprint = Sprint.fromPersistence({
      id: "s1",
      startDate,
      endDate,
      taskIds: ["t1", "t2"],
    });
    expect(sprint.taskIds).toEqual(["t1", "t2"]);
  });
});
