/**
 * Unit tests for Task aggregate (COMP-029.1).
 */

import { describe, it, expect } from "vitest";
import { Task } from "../../src/domain/task.js";
import { TaskStatus } from "../../src/domain/task-status.js";
import { InvalidTaskTransitionError } from "../../src/domain/errors.js";

describe("Task aggregate (COMP-029.1)", () => {
  it("create builds task in todo status", () => {
    const task = Task.create({
      taskId: "t1",
      userId: "u1",
      title: "Implement feature",
    });
    expect(task.taskId).toBe("t1");
    expect(task.userId).toBe("u1");
    expect(task.title).toBe("Implement feature");
    expect(task.status).toBe(TaskStatus.Todo);
  });

  it("create trims whitespace from taskId userId and title", () => {
    const task = Task.create({
      taskId: "  t1  ",
      userId: "  u1  ",
      title: "  Title  ",
    });
    expect(task.taskId).toBe("t1");
    expect(task.userId).toBe("u1");
    expect(task.title).toBe("Title");
  });

  it("create throws when taskId is empty", () => {
    expect(() =>
      Task.create({ taskId: "", userId: "u1", title: "T" })
    ).toThrow("Task.taskId cannot be empty");
    expect(() =>
      Task.create({ taskId: "  ", userId: "u1", title: "T" })
    ).toThrow("Task.taskId cannot be empty");
  });

  it("create throws when userId is empty", () => {
    expect(() =>
      Task.create({ taskId: "t1", userId: "", title: "T" })
    ).toThrow("Task.userId cannot be empty");
  });

  it("create throws when title is empty", () => {
    expect(() =>
      Task.create({ taskId: "t1", userId: "u1", title: "" })
    ).toThrow("Task.title cannot be empty");
  });

  it("fromPersistence reconstructs task with given status", () => {
    const task = Task.fromPersistence({
      taskId: "t1",
      userId: "u1",
      title: "Done task",
      status: TaskStatus.Done,
    });
    expect(task.taskId).toBe("t1");
    expect(task.status).toBe(TaskStatus.Done);
  });

  it("start transitions todo to in_progress", () => {
    const task = Task.create({
      taskId: "t1",
      userId: "u1",
      title: "Work",
    });
    const started = task.start();
    expect(started.status).toBe(TaskStatus.InProgress);
    expect(task.status).toBe(TaskStatus.Todo);
  });

  it("start throws when not in todo", () => {
    const inProgress = Task.fromPersistence({
      taskId: "t1",
      userId: "u1",
      title: "T",
      status: TaskStatus.InProgress,
    });
    expect(() => inProgress.start()).toThrow(InvalidTaskTransitionError);
    expect(() => inProgress.start()).toThrow(/from "in_progress" to "in_progress"/);

    const done = Task.fromPersistence({
      taskId: "t1",
      userId: "u1",
      title: "T",
      status: TaskStatus.Done,
    });
    expect(() => done.start()).toThrow(InvalidTaskTransitionError);
  });

  it("complete transitions in_progress to done", () => {
    const inProgress = Task.create({
      taskId: "t1",
      userId: "u1",
      title: "T",
    }).start();
    const completed = inProgress.complete();
    expect(completed.status).toBe(TaskStatus.Done);
  });

  it("complete throws when not in_progress", () => {
    const todo = Task.create({
      taskId: "t1",
      userId: "u1",
      title: "T",
    });
    expect(() => todo.complete()).toThrow(InvalidTaskTransitionError);
    expect(() => todo.complete()).toThrow(/from "todo" to "done"/);
  });

  it("cancel transitions todo to cancelled", () => {
    const task = Task.create({
      taskId: "t1",
      userId: "u1",
      title: "T",
    });
    const cancelled = task.cancel();
    expect(cancelled.status).toBe(TaskStatus.Cancelled);
  });

  it("cancel transitions in_progress to cancelled", () => {
    const task = Task.create({
      taskId: "t1",
      userId: "u1",
      title: "T",
    }).start();
    const cancelled = task.cancel();
    expect(cancelled.status).toBe(TaskStatus.Cancelled);
  });

  it("cancel throws when already done or cancelled", () => {
    const done = Task.fromPersistence({
      taskId: "t1",
      userId: "u1",
      title: "T",
      status: TaskStatus.Done,
    });
    expect(() => done.cancel()).toThrow(InvalidTaskTransitionError);

    const cancelled = Task.fromPersistence({
      taskId: "t1",
      userId: "u1",
      title: "T",
      status: TaskStatus.Cancelled,
    });
    expect(() => cancelled.cancel()).toThrow(InvalidTaskTransitionError);
  });

  it("full lifecycle todo → in_progress → done", () => {
    let task = Task.create({
      taskId: "t1",
      userId: "u1",
      title: "Full lifecycle",
    });
    expect(task.status).toBe(TaskStatus.Todo);
    task = task.start();
    expect(task.status).toBe(TaskStatus.InProgress);
    task = task.complete();
    expect(task.status).toBe(TaskStatus.Done);
  });
});
