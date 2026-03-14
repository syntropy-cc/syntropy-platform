/**
 * Unit tests for DiscoveryDocument read model (COMP-021.1).
 */

import { describe, it, expect } from "vitest";
import {
  createEmptyDocument,
  applyDiscoveryEvent,
  withProminenceScore,
  withProjectCount,
  type DiscoveryDocument,
  type DipGovernanceEventPayload,
  type HubContributionEventPayload,
} from "../../../src/domain/public-square/discovery-document.js";

describe("DiscoveryDocument", () => {
  describe("createEmptyDocument", () => {
    it("returns document with institutionId and default name and counts", () => {
      const doc = createEmptyDocument("inst-1", "Acme Lab");
      expect(doc.institutionId).toBe("inst-1");
      expect(doc.name).toBe("Acme Lab");
      expect(doc.prominenceScore).toBe(0);
      expect(doc.projectCount).toBe(0);
      expect(doc.contributorCount).toBe(0);
      expect(doc.recentArtifacts).toEqual([]);
    });

    it("uses empty name when name not provided", () => {
      const doc = createEmptyDocument("inst-2");
      expect(doc.name).toBe("");
    });
  });

  describe("applyDiscoveryEvent", () => {
    it("institution_created creates new document with name", () => {
      const event: DipGovernanceEventPayload = {
        type: "institution_created",
        institutionId: "inst-new",
        name: "New Institution",
      };
      const doc = applyDiscoveryEvent(null, event);
      expect(doc.institutionId).toBe("inst-new");
      expect(doc.name).toBe("New Institution");
      expect(doc.recentArtifacts).toEqual([]);
    });

    it("institution_updated updates name on existing document", () => {
      const current = createEmptyDocument("inst-1", "Old Name");
      const event: DipGovernanceEventPayload = {
        type: "institution_updated",
        institutionId: "inst-1",
        name: "Updated Name",
      };
      const doc = applyDiscoveryEvent(current, event);
      expect(doc.institutionId).toBe("inst-1");
      expect(doc.name).toBe("Updated Name");
    });

    it("institution_updated keeps existing name when name not in event", () => {
      const current = createEmptyDocument("inst-1", "Kept Name");
      const event: DipGovernanceEventPayload = {
        type: "institution_updated",
        institutionId: "inst-1",
      };
      const doc = applyDiscoveryEvent(current, event);
      expect(doc.name).toBe("Kept Name");
    });

    it("contribution_integrated adds artifact to recentArtifacts", () => {
      const current = createEmptyDocument("inst-1", "Lab");
      const event: HubContributionEventPayload = {
        type: "contribution_integrated",
        institutionId: "inst-1",
        artifactId: "art-123",
      };
      const doc = applyDiscoveryEvent(current, event);
      expect(doc.recentArtifacts).toHaveLength(1);
      expect(doc.recentArtifacts[0]!.artifactId).toBe("art-123");
      expect(doc.recentArtifacts[0]!.at).toBeDefined();
    });

    it("contribution_integrated creates document when current is null", () => {
      const event: HubContributionEventPayload = {
        type: "contribution_integrated",
        institutionId: "inst-2",
        artifactId: "art-456",
      };
      const doc = applyDiscoveryEvent(null, event);
      expect(doc.institutionId).toBe("inst-2");
      expect(doc.recentArtifacts).toHaveLength(1);
      expect(doc.recentArtifacts[0]!.artifactId).toBe("art-456");
    });

    it("contribution_integrated without institutionId returns current or empty", () => {
      const current = createEmptyDocument("inst-1", "Lab");
      const event: HubContributionEventPayload = {
        type: "contribution_integrated",
        artifactId: "art-789",
      };
      const doc = applyDiscoveryEvent(current, event);
      expect(doc.institutionId).toBe("inst-1");
      const docNull = applyDiscoveryEvent(null, event);
      expect(docNull.institutionId).toBe("");
    });

    it("multiple contribution_integrated events append to recentArtifacts up to limit", () => {
      let doc: DiscoveryDocument | null = createEmptyDocument("inst-1", "Lab");
      for (let i = 0; i < 12; i++) {
        doc = applyDiscoveryEvent(doc, {
          type: "contribution_integrated",
          institutionId: "inst-1",
          artifactId: `art-${i}`,
        });
      }
      expect(doc!.recentArtifacts).toHaveLength(10);
      expect(doc!.recentArtifacts[0]!.artifactId).toBe("art-11");
      expect(doc!.recentArtifacts[9]!.artifactId).toBe("art-2");
    });
  });

  describe("withProminenceScore", () => {
    it("returns new document with updated prominenceScore", () => {
      const doc = createEmptyDocument("inst-1", "Lab");
      const updated = withProminenceScore(doc, 75.5);
      expect(updated.prominenceScore).toBe(75.5);
      expect(doc.prominenceScore).toBe(0);
    });
  });

  describe("withProjectCount", () => {
    it("returns new document with updated projectCount", () => {
      const doc = createEmptyDocument("inst-1", "Lab");
      const updated = withProjectCount(doc, 3);
      expect(updated.projectCount).toBe(3);
      expect(doc.projectCount).toBe(0);
    });
  });
});
