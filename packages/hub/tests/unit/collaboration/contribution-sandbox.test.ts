/**
 * Unit tests for ContributionSandbox aggregate (COMP-019.3).
 */

import { describe, it, expect } from "vitest";
import {
  ContributionSandbox,
  type SandboxConfig,
} from "../../../src/domain/collaboration/contribution-sandbox.js";
import { ContributionSandboxStatus } from "../../../src/domain/collaboration/contribution-sandbox-status.js";

describe("ContributionSandbox aggregate", () => {
  describe("create", () => {
    it("creates a sandbox in setting_up status with config and resource limits", () => {
      const config: SandboxConfig = {
        maxParticipants: 10,
        challengeDefinition: { type: "code", language: "ts" },
      };
      const sandbox = ContributionSandbox.create({
        id: "sandbox-1",
        projectId: "proj-1",
        title: "Hackathon Q1",
        challengeDescription: "Build a CLI tool",
        config,
      });

      expect(sandbox.status).toBe(ContributionSandboxStatus.SettingUp);
      expect(sandbox.ideSessionId).toBeNull();
      expect(sandbox.challengeIssueIds).toEqual([]);
      expect(sandbox.participantContributionIds).toEqual([]);
      expect(sandbox.config.maxParticipants).toBe(10);
      expect(sandbox.startedAt).toBeNull();
      expect(sandbox.completedAt).toBeNull();
    });

    it("throws when title is empty", () => {
      expect(() =>
        ContributionSandbox.create({
          id: "s",
          projectId: "p",
          title: "  ",
          challengeDescription: "d",
        })
      ).toThrow("ContributionSandbox.title cannot be empty");
    });
  });

  describe("activate", () => {
    it("transitions to active and sets ideSessionId and startedAt", () => {
      const sandbox = ContributionSandbox.create({
        id: "s1",
        projectId: "p",
        title: "Challenge",
        challengeDescription: "Desc",
      });
      const { sandbox: active, event } = sandbox.activate("session-abc");

      expect(active.status).toBe(ContributionSandboxStatus.Active);
      expect(active.ideSessionId).toBe("session-abc");
      expect(active.startedAt).not.toBeNull();
      expect(event.type).toBe("hub.hackin.started");
      expect(event.sandboxId).toBe("s1");
      expect(event.status).toBe(ContributionSandboxStatus.Active);
    });

    it("throws when not in setting_up", () => {
      const sandbox = ContributionSandbox.create({
        id: "s1",
        projectId: "p",
        title: "C",
        challengeDescription: "D",
      });
      const { sandbox: active } = sandbox.activate("session-1");

      expect(() => active.activate("session-2")).toThrow(
        /expected status setting_up/
      );
    });

    it("throws when ideSessionId is empty", () => {
      const sandbox = ContributionSandbox.create({
        id: "s1",
        projectId: "p",
        title: "C",
        challengeDescription: "D",
      });

      expect(() => sandbox.activate("  ")).toThrow("ideSessionId cannot be empty");
    });
  });

  describe("complete", () => {
    it("transitions to completed and emits hub.hackin.completed", () => {
      let sandbox = ContributionSandbox.create({
        id: "s1",
        projectId: "p",
        title: "C",
        challengeDescription: "D",
      });
      sandbox = sandbox.activate("session-1").sandbox;
      sandbox = sandbox.addParticipantContribution("contrib-1");
      const { sandbox: completed, event } = sandbox.complete();

      expect(completed.status).toBe(ContributionSandboxStatus.Completed);
      expect(completed.completedAt).not.toBeNull();
      expect(event.type).toBe("hub.hackin.completed");
      expect(event.participantContributionIds).toEqual(["contrib-1"]);
    });

    it("throws when not active", () => {
      const sandbox = ContributionSandbox.create({
        id: "s1",
        projectId: "p",
        title: "C",
        challengeDescription: "D",
      });

      expect(() => sandbox.complete()).toThrow(/expected status active/);
    });
  });

  describe("addChallengeIssue and addParticipantContribution", () => {
    it("adds challenge issue and participant contribution ids", () => {
      let sandbox = ContributionSandbox.create({
        id: "s1",
        projectId: "p",
        title: "C",
        challengeDescription: "D",
      });
      sandbox = sandbox.addChallengeIssue("issue-1").addChallengeIssue("issue-2");
      sandbox = sandbox.addParticipantContribution("c1").addParticipantContribution("c2");

      expect(sandbox.challengeIssueIds).toEqual(["issue-1", "issue-2"]);
      expect(sandbox.participantContributionIds).toEqual(["c1", "c2"]);
    });

    it("does not duplicate challenge issue or contribution ids", () => {
      let sandbox = ContributionSandbox.create({
        id: "s1",
        projectId: "p",
        title: "C",
        challengeDescription: "D",
      });
      sandbox = sandbox.addChallengeIssue("issue-1").addChallengeIssue("issue-1");
      sandbox = sandbox.addParticipantContribution("c1").addParticipantContribution("c1");

      expect(sandbox.challengeIssueIds).toEqual(["issue-1"]);
      expect(sandbox.participantContributionIds).toEqual(["c1"]);
    });
  });

  describe("fromPersistence", () => {
    it("reconstructs sandbox with given status", () => {
      const sandbox = ContributionSandbox.fromPersistence({
        id: "s1",
        projectId: "p",
        title: "T",
        challengeDescription: "D",
        status: ContributionSandboxStatus.Active,
        config: {},
        ideSessionId: "session-x",
        challengeIssueIds: ["i1"],
        participantContributionIds: ["c1"],
        startedAt: new Date(),
        completedAt: null,
      });

      expect(sandbox.status).toBe(ContributionSandboxStatus.Active);
      expect(sandbox.ideSessionId).toBe("session-x");
      expect(sandbox.challengeIssueIds).toEqual(["i1"]);
    });
  });
});
