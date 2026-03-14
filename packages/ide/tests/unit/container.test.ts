/**
 * Unit tests for Container value object (COMP-030.2).
 */

import { describe, it, expect } from "vitest";
import {
  Container,
  ContainerStatus,
} from "../../src/domain/container.js";

describe("Container (COMP-030.2)", () => {
  describe("create", () => {
    it("creates container with required fields and default status creating", () => {
      const c = Container.create({
        containerId: "cnt-1",
        image: "node:20",
        cpuLimit: 1,
        memoryLimit: 512,
      });
      expect(c.containerId).toBe("cnt-1");
      expect(c.image).toBe("node:20");
      expect(c.cpuLimit).toBe(1);
      expect(c.memoryLimit).toBe(512);
      expect(c.status).toBe(ContainerStatus.Creating);
    });

    it("creates container with explicit status", () => {
      const c = Container.create({
        containerId: "cnt-2",
        image: "node:20",
        cpuLimit: 2,
        memoryLimit: 1024,
        status: ContainerStatus.Running,
      });
      expect(c.status).toBe(ContainerStatus.Running);
    });

    it("throws when containerId is empty", () => {
      expect(() =>
        Container.create({
          containerId: "",
          image: "node:20",
          cpuLimit: 1,
          memoryLimit: 512,
        })
      ).toThrow("containerId cannot be empty");
    });

    it("throws when image is empty", () => {
      expect(() =>
        Container.create({
          containerId: "cnt-1",
          image: "",
          cpuLimit: 1,
          memoryLimit: 512,
        })
      ).toThrow("image cannot be empty");
    });

    it("throws when cpuLimit is not positive", () => {
      expect(() =>
        Container.create({
          containerId: "cnt-1",
          image: "node:20",
          cpuLimit: 0,
          memoryLimit: 512,
        })
      ).toThrow("cpuLimit must be a positive number");
    });

    it("throws when memoryLimit is not positive", () => {
      expect(() =>
        Container.create({
          containerId: "cnt-1",
          image: "node:20",
          cpuLimit: 1,
          memoryLimit: 0,
        })
      ).toThrow("memoryLimit must be a positive number");
    });
  });

  describe("value object", () => {
    it("returns same values for same inputs", () => {
      const c = Container.create({
        containerId: "cnt-1",
        image: "node:20",
        cpuLimit: 1,
        memoryLimit: 512,
      });
      expect(c.containerId).toBe("cnt-1");
      expect(c.image).toBe("node:20");
      expect(c.cpuLimit).toBe(1);
      expect(c.memoryLimit).toBe(512);
    });
  });
});
