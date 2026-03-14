/**
 * Unit tests for StudyPlan aggregate and StudyPlanService (COMP-029.3).
 */

import { describe, it, expect } from "vitest";
import { StudyPlan } from "../../src/domain/study-plan.js";
import { StudyPlanService } from "../../src/application/study-plan-service.js";
import type { LearnerProgressPort } from "../../src/domain/ports/learner-progress-port.js";

describe("StudyPlan aggregate (COMP-029.3)", () => {
  it("create builds plan with suggested path", () => {
    const plan = StudyPlan.create({
      id: "sp1",
      userId: "u1",
      careerId: "c1",
      suggestedPath: [
        { stepId: "f1", order: 0 },
        { stepId: "f2", order: 1 },
      ],
    });
    expect(plan.id).toBe("sp1");
    expect(plan.userId).toBe("u1");
    expect(plan.careerId).toBe("c1");
    expect(plan.suggestedPath).toHaveLength(2);
    expect(plan.suggestedPath[0].stepId).toBe("f1");
    expect(plan.suggestedPath[1].stepId).toBe("f2");
  });

  it("create throws when id or userId or careerId is empty", () => {
    expect(() =>
      StudyPlan.create({
        id: "",
        userId: "u1",
        careerId: "c1",
        suggestedPath: [],
      })
    ).toThrow("StudyPlan.id cannot be empty");
    expect(() =>
      StudyPlan.create({
        id: "sp1",
        userId: "",
        careerId: "c1",
        suggestedPath: [],
      })
    ).toThrow("StudyPlan.userId cannot be empty");
    expect(() =>
      StudyPlan.create({
        id: "sp1",
        userId: "u1",
        careerId: "  ",
        suggestedPath: [],
      })
    ).toThrow("StudyPlan.careerId cannot be empty");
  });

  it("fromPersistence reconstructs plan", () => {
    const plan = StudyPlan.fromPersistence({
      id: "sp1",
      userId: "u1",
      careerId: "c1",
      suggestedPath: [{ stepId: "f1", order: 0, label: "Intro" }],
    });
    expect(plan.suggestedPath[0].label).toBe("Intro");
  });
});

describe("StudyPlanService.generate (COMP-029.3)", () => {
  it("builds suggested path from port excluding completed steps", async () => {
    const port: LearnerProgressPort = {
      getProgress: async () => ({
        careerId: "c1",
        userId: "u1",
        accessibleStepIds: ["f1", "f2", "f3"],
        completedStepIds: ["f1"],
      }),
    };
    const service = new StudyPlanService(port);
    const plan = await service.generate("u1", "c1");
    expect(plan.userId).toBe("u1");
    expect(plan.careerId).toBe("c1");
    expect(plan.suggestedPath.map((s) => s.stepId)).toEqual(["f2", "f3"]);
    expect(plan.suggestedPath[0].order).toBe(0);
    expect(plan.suggestedPath[1].order).toBe(1);
  });

  it("returns empty suggested path when all steps completed", async () => {
    const port: LearnerProgressPort = {
      getProgress: async () => ({
        careerId: "c1",
        userId: "u1",
        accessibleStepIds: ["f1", "f2"],
        completedStepIds: ["f1", "f2"],
      }),
    };
    const service = new StudyPlanService(port);
    const plan = await service.generate("u1", "c1");
    expect(plan.suggestedPath).toHaveLength(0);
  });
});
