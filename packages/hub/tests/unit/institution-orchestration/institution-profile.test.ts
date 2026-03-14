/**
 * Unit tests for InstitutionProfile read model and InstitutionProfileProjector (COMP-020.3).
 */

import { describe, it, expect } from "vitest";
import type { InstitutionProfile } from "../../../src/domain/institution-orchestration/institution-profile.js";
import { InstitutionProfileProjector } from "../../../src/application/institution-profile-projector.js";

describe("InstitutionProfile", () => {
  it("has all display-ready fields", () => {
    const profile: InstitutionProfile = {
      institutionId: "dip-inst-1",
      name: "Test Institution",
      institutionType: "open_source_project",
      memberCount: 10,
      activeProposalsCount: 2,
      legitimacyChainLength: 5,
      governanceContractSummary: "Single chamber, 50% threshold",
      treasuryBalanceAvu: 1000,
      openIssueCount: 3,
    };

    expect(profile.institutionId).toBe("dip-inst-1");
    expect(profile.name).toBe("Test Institution");
    expect(profile.memberCount).toBe(10);
    expect(profile.openIssueCount).toBe(3);
  });
});

describe("InstitutionProfileProjector", () => {
  it("getProfile returns profile when reader returns data", async () => {
    const stubProfile: InstitutionProfile = {
      institutionId: "inst-1",
      name: "Stub Inst",
      institutionType: "research_laboratory",
      memberCount: 5,
      activeProposalsCount: 0,
      legitimacyChainLength: 1,
      governanceContractSummary: "Stub",
      treasuryBalanceAvu: 0,
      openIssueCount: 0,
    };
    const reader = {
      getProfile: async (id: string) =>
        id === "inst-1" ? stubProfile : null,
    };
    const projector = new InstitutionProfileProjector(reader);

    const result = await projector.getProfile("inst-1");

    expect(result).not.toBeNull();
    expect(result!.institutionId).toBe("inst-1");
    expect(result!.name).toBe("Stub Inst");
    expect(result!.institutionType).toBe("research_laboratory");
    expect(result!.memberCount).toBe(5);
  });

  it("getProfile returns null when reader returns null", async () => {
    const reader = {
      getProfile: async () => null,
    };
    const projector = new InstitutionProfileProjector(reader);

    const result = await projector.getProfile("non-existent");

    expect(result).toBeNull();
  });

  it("getProfile returns null when institutionId is empty", async () => {
    const reader = {
      getProfile: async () => ({
        institutionId: "x",
        name: "X",
        institutionType: "open_source_project",
        memberCount: 0,
        activeProposalsCount: 0,
        legitimacyChainLength: 0,
        governanceContractSummary: "",
        treasuryBalanceAvu: 0,
        openIssueCount: 0,
      }),
    };
    const projector = new InstitutionProfileProjector(reader);

    expect(await projector.getProfile("")).toBeNull();
    expect(await projector.getProfile("  ")).toBeNull();
  });

  it("getProfile trims institutionId before calling reader", async () => {
    let receivedId: string | null = null;
    const reader = {
      getProfile: async (id: string) => {
        receivedId = id;
        return id ? { institutionId: id, name: "X", institutionType: "open_source_project", memberCount: 0, activeProposalsCount: 0, legitimacyChainLength: 0, governanceContractSummary: "", treasuryBalanceAvu: 0, openIssueCount: 0 } : null;
      },
    };
    const projector = new InstitutionProfileProjector(reader);

    await projector.getProfile("  inst-2  ");

    expect(receivedId).toBe("inst-2");
  });
});
