/**
 * Unit tests for DigitalInstitution aggregate (COMP-007.1).
 */

import { describe, it, expect } from "vitest";
import { DigitalInstitution } from "../../src/domain/digital-institution.js";

describe("DigitalInstitution.create", () => {
  it("creates institution in forming status with required fields", () => {
    const inst = DigitalInstitution.create({
      institutionId: "inst-001",
      name: "Test Lab",
      type: "laboratory",
      governanceContract: "contract-001",
    });
    expect(inst.institutionId).toBe("inst-001");
    expect(inst.name).toBe("Test Lab");
    expect(inst.type).toBe("laboratory");
    expect(inst.governanceContract).toBe("contract-001");
    expect(inst.status).toBe("forming");
  });

  it("trims whitespace from string fields", () => {
    const inst = DigitalInstitution.create({
      institutionId: "  inst-002  ",
      name: "  Chamber A  ",
      type: "  chamber  ",
      governanceContract: "  contract-002  ",
    });
    expect(inst.institutionId).toBe("inst-002");
    expect(inst.name).toBe("Chamber A");
    expect(inst.type).toBe("chamber");
    expect(inst.governanceContract).toBe("contract-002");
  });

  it("throws when institutionId is empty", () => {
    expect(() =>
      DigitalInstitution.create({
        institutionId: "",
        name: "X",
        type: "lab",
        governanceContract: "c1",
      })
    ).toThrow(/institutionId cannot be empty/);
    expect(() =>
      DigitalInstitution.create({
        institutionId: "   ",
        name: "X",
        type: "lab",
        governanceContract: "c1",
      })
    ).toThrow(/institutionId cannot be empty/);
  });

  it("throws when name is empty", () => {
    expect(() =>
      DigitalInstitution.create({
        institutionId: "i1",
        name: "",
        type: "lab",
        governanceContract: "c1",
      })
    ).toThrow(/name cannot be empty/);
  });

  it("throws when type is empty", () => {
    expect(() =>
      DigitalInstitution.create({
        institutionId: "i1",
        name: "N",
        type: "",
        governanceContract: "c1",
      })
    ).toThrow(/type cannot be empty/);
  });

  it("throws when governanceContract is empty", () => {
    expect(() =>
      DigitalInstitution.create({
        institutionId: "i1",
        name: "N",
        type: "lab",
        governanceContract: "",
      })
    ).toThrow(/governanceContract cannot be empty/);
  });
});

describe("DigitalInstitution.fromPersistence", () => {
  it("reconstructs aggregate with all statuses", () => {
    const forming = DigitalInstitution.fromPersistence({
      institutionId: "i1",
      name: "F",
      type: "lab",
      governanceContract: "c1",
      status: "forming",
    });
    expect(forming.status).toBe("forming");

    const active = DigitalInstitution.fromPersistence({
      institutionId: "i2",
      name: "A",
      type: "chamber",
      governanceContract: "c2",
      status: "active",
    });
    expect(active.status).toBe("active");

    const dissolved = DigitalInstitution.fromPersistence({
      institutionId: "i3",
      name: "D",
      type: "lab",
      governanceContract: "c3",
      status: "dissolved",
    });
    expect(dissolved.status).toBe("dissolved");
  });
});
