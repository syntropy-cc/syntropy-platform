/**
 * Unit tests for AgentRegistry and AIAgentDefinition (COMP-013.1).
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  createAIAgentDefinition,
  InMemoryAgentRegistry,
} from "../../../src/domain/registry/index.js";

describe("AIAgentDefinition", () => {
  it("createAIAgentDefinition returns immutable definition with all fields", () => {
    const def = createAIAgentDefinition({
      agentId: "agent-learn-1",
      name: "Learn Assistant",
      pillar: "learn",
      toolIds: ["tool-fragment", "tool-course"],
      systemPromptId: "prompt-learn-v1",
    });
    expect(def.agentId).toBe("agent-learn-1");
    expect(def.name).toBe("Learn Assistant");
    expect(def.pillar).toBe("learn");
    expect(def.toolIds).toEqual(["tool-fragment", "tool-course"]);
    expect(def.systemPromptId).toBe("prompt-learn-v1");
    expect(def.toolIds).toHaveLength(2);
  });
});

describe("InMemoryAgentRegistry", () => {
  let registry: InMemoryAgentRegistry;

  beforeEach(() => {
    registry = new InMemoryAgentRegistry();
  });

  it("findByPillar returns empty array when no agents registered", async () => {
    const result = await registry.findByPillar("learn");
    expect(result).toEqual([]);
  });

  it("register stores definition and findByPillar returns it", async () => {
    const def = createAIAgentDefinition({
      agentId: "agent-1",
      name: "Learn Agent",
      pillar: "learn",
      toolIds: ["t1"],
      systemPromptId: "p1",
    });
    await registry.register(def);
    const found = await registry.findByPillar("learn");
    expect(found).toHaveLength(1);
    expect(found[0].agentId).toBe("agent-1");
    expect(found[0].name).toBe("Learn Agent");
    expect(found[0].pillar).toBe("learn");
    expect(found[0].toolIds).toEqual(["t1"]);
  });

  it("findByPillar returns only agents for that pillar", async () => {
    await registry.register(
      createAIAgentDefinition({
        agentId: "a-learn",
        name: "Learn",
        pillar: "learn",
        toolIds: [],
        systemPromptId: "p1",
      })
    );
    await registry.register(
      createAIAgentDefinition({
        agentId: "a-hub",
        name: "Hub",
        pillar: "hub",
        toolIds: [],
        systemPromptId: "p2",
      })
    );
    await registry.register(
      createAIAgentDefinition({
        agentId: "a-learn-2",
        name: "Learn 2",
        pillar: "learn",
        toolIds: ["t1"],
        systemPromptId: "p3",
      })
    );

    const learnAgents = await registry.findByPillar("learn");
    expect(learnAgents).toHaveLength(2);
    expect(learnAgents.map((a) => a.agentId).sort()).toEqual(["a-learn", "a-learn-2"]);

    const hubAgents = await registry.findByPillar("hub");
    expect(hubAgents).toHaveLength(1);
    expect(hubAgents[0].agentId).toBe("a-hub");
  });

  it("register with same agentId overwrites previous definition", async () => {
    await registry.register(
      createAIAgentDefinition({
        agentId: "agent-1",
        name: "First",
        pillar: "learn",
        toolIds: ["t1"],
        systemPromptId: "p1",
      })
    );
    await registry.register(
      createAIAgentDefinition({
        agentId: "agent-1",
        name: "Updated",
        pillar: "learn",
        toolIds: ["t1", "t2"],
        systemPromptId: "p2",
      })
    );
    const found = await registry.findByPillar("learn");
    expect(found).toHaveLength(1);
    expect(found[0].name).toBe("Updated");
    expect(found[0].toolIds).toEqual(["t1", "t2"]);
    expect(found[0].systemPromptId).toBe("p2");
  });
});
