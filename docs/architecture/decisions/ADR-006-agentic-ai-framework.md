# ADR-006: Agentic AI Framework — Anthropic/OpenAI APIs with Custom Orchestration

## Status

Accepted

## Date

2026-03-12

## Context

The AI Agents domain is a Core Domain (orchestration layer) providing context-aware AI agents to all three pillars. Vision Section 12 (Capability: AI Agents) describes a system where each pillar has specialized agents (Learn: 5 agents, Hub: 3 agents, Labs: 3 agents, plus a cross-pillar navigator) powered by a unified `UserContextModel` that aggregates the user's portfolio, active projects, research lines, learning progress, and contributions across all pillars.

The AI agent system has several distinctive requirements that distinguish it from a simple LLM API call wrapper:

1. **Unified cross-pillar context**: Agent invocations must carry a `UserContextModel` assembled from data owned by Platform Core, Learn, Hub, Labs, and DIP. This cross-pillar context is what gives the AI agents their differentiated value — they understand where a user is in their entire learning/building/researching journey, not just the current pillar.
2. **Agent memory**: Long-term memory (persisted across sessions) and session memory (within a single conversation) enable agents to provide contextually coherent assistance. Without this, every agent interaction starts from zero.
3. **Tool layer with domain scoping**: Agents invoke platform tools (e.g., `search_artifacts`, `create_fragment`, `review_issue`) that are scoped by pillar and permission level. A tool callable by a Learn agent may not be callable by a Labs agent.
4. **Content authorship integrity**: Vision Section 12 and Section 10 require that AI-generated content be explicitly marked as AI-generated and that human creators retain full authorship. AI drafts require human approval before publication. This means the data model must store `ai_generated: boolean` and `approved_by_human: boolean` fields on AI-assisted content.
5. **Agent registry and versioning**: Agents have `SystemPrompt`, `ToolSet`, and `ActivationPolicy` that must be versioned and discoverable. Changes to an agent's prompt or tool set must be auditable.
6. **Model flexibility**: The system must not be locked to a single LLM vendor. The team's current preference is Anthropic Claude for long-context tasks (scientific article drafting) and OpenAI GPT-4o for tool use and structured output. Future models (open-source, specialized) must be addable.

The central architectural question is: **how much AI framework infrastructure to build vs. buy?**

## Decision

We will use **direct LLM API integration** (Anthropic Claude API + OpenAI API) with a **custom orchestration layer** built within the AI Agents domain, wrapped behind an `ILLMAdapter` interface. We will **not adopt a full AI orchestration framework** (LangChain, LangGraph, AutoGen) as the primary architectural foundation.

Specifically:

1. **`ILLMAdapter` interface** (Anti-Corruption Layer in `packages/ai-agents/infrastructure/`):
   ```typescript
   interface ILLMAdapter {
     complete(request: LLMRequest): Promise<LLMResponse>;
     completeWithTools(request: LLMToolRequest): Promise<LLMToolResponse>;
     streamComplete(request: LLMRequest): AsyncIterable<LLMStreamChunk>;
   }
   ```
   `AnthropicAdapter` and `OpenAIAdapter` implement this interface. The AI Agents domain never calls Anthropic or OpenAI SDKs directly.

2. **Custom `AgentOrchestrator`** (Application layer): Assembles the `UserContextModel`, selects the appropriate agent definition from the registry, constructs the system prompt with context, manages the tool call loop, and records the session in `AgentSession`. This is implemented as custom application logic — it does not delegate to a framework's orchestration primitives.

3. **`AgentRegistry`** (Domain aggregate): Stores versioned `AIAgent` definitions containing `systemPrompt`, `toolSet`, and `activationPolicy`. Agents are referenced by name and version. Registry changes are auditable events.

4. **`AgentMemory`** model:
   - **Session memory**: ephemeral context within a single `AgentSession` (stored in PostgreSQL, TTL-expired after session close)
   - **Long-term memory**: distilled summaries written to `AgentMemory` entities after significant interactions; retrieved during `UserContextModel` assembly

5. **AI-generated content marking**: Any content created with AI assistance carries metadata:
   ```typescript
   interface AIAssistedContent {
     ai_generated: boolean;
     ai_model_used: string | null;   // e.g., "claude-3-5-sonnet-20241022"
     human_approved: boolean;
     approved_by: UserId | null;
     approved_at: Timestamp | null;
   }
   ```
   Content with `human_approved: false` cannot be published (enforced at the domain level).

6. **Tool layer**: Tools are TypeScript functions implementing `ITool<TInput, TOutput>` with explicit input/output schemas. Tools are grouped by domain and scoped by permission level. The `AgentOrchestrator` injects only the tools authorized for the current user's role and the current agent.

7. **Model selection**: Individual agents specify their preferred model in the `AIAgent` registry entry. The orchestrator passes this preference to the `ILLMAdapter`, which routes to the appropriate provider. Default: Anthropic Claude 3.5 Sonnet for long-form generation; OpenAI GPT-4o for tool-use-heavy tasks.

## Alternatives Considered

### Alternative 1: LangChain / LangGraph as Primary Orchestration Framework

Use LangChain (Python or JS) as the orchestration framework with LangGraph for stateful agent workflows.

**Pros**:
- Large ecosystem of integrations, vector stores, retrieval chains
- LangGraph's state machine model fits multi-step agent workflows
- Reduces boilerplate for tool definition, prompt templates, chain composition
- Active community and extensive documentation

**Cons**:
- LangChain's abstraction layer has historically been leaky and unstable — major API changes between versions have broken production systems; the framework's "do everything" scope makes it hard to understand what code actually runs
- LangGraph (Python-first) would require adding a Python service to a TypeScript-first monorepo (ADR-001), creating a language boundary with its own IPC overhead
- The framework's generic abstractions obscure the domain-specific logic — the `UserContextModel`, `AgentRegistry`, and tool scoping need to be custom regardless; LangChain adds framework overhead without eliminating the custom work
- Debugging LangChain agent traces is notoriously difficult — observability is worse than with direct API calls + custom tracing
- Vendor and framework coupling: LangChain is a third-party framework, not a standard protocol. Being dependent on its architectural patterns limits the team's control.

**Why rejected**: The custom orchestration required (UserContextModel assembly, per-agent tool scoping, cross-pillar context, long-term memory model) is substantial regardless of framework. LangChain would add a layer of abstraction without eliminating the custom work — and its historical instability and Python-first nature conflict with the TypeScript monorepo constraint (ADR-001). Direct API calls + custom orchestration give full control and better observability.

### Alternative 2: Self-Hosted Open-Source LLMs (Ollama / vLLM)

Host open-source models (Llama 3, Mistral, Qwen) locally using Ollama or vLLM rather than calling commercial APIs.

**Pros**:
- No per-token API cost; fixed infrastructure cost
- Data never leaves the platform — strong privacy guarantee
- Full control over model versions and fine-tuning
- Aligns with open-source platform philosophy

**Cons**:
- GPU infrastructure cost is high: serving a capable open-source model (70B parameters) requires multiple A100/H100 GPUs — financially prohibitive at startup phase
- Quality gap: current open-source models (as of early 2026) lag behind Anthropic Claude and OpenAI GPT-4o on long-form scientific writing, structured output, and complex tool use — which are the primary AI use cases in this system
- Operational overhead: managing GPU clusters, model serving infrastructure, and model updates adds significant DevOps complexity for a 2–5 developer team
- Fine-tuning investment: improving open-source model quality for domain-specific tasks (scientific writing, code generation for IDE) requires substantial ML expertise

**Why rejected**: The quality and operational cost trade-offs are unfavorable at the current team size and development stage. The `ILLMAdapter` interface explicitly supports adding self-hosted model adapters later — this is not a permanent decision. If open-source model quality meets requirements and infrastructure costs decrease, the adapter can be swapped without domain-level changes.

### Alternative 3: AutoGen (Microsoft) or CrewAI

Multi-agent frameworks where agents are autonomous entities that communicate with each other to complete tasks.

**Pros**:
- Built-in multi-agent communication patterns
- Suitable for tasks requiring agent collaboration (e.g., research + writing + review)

**Cons**:
- Multi-agent autonomous communication adds unpredictability to agent behavior — in the Syntropy context, agents must produce deterministic, human-approvable outputs, not autonomously collaborate without human checkpoints
- Framework-specific agent concepts would need to be translated through an ACL into the AI Agents domain's ubiquitous language (AIAgent, AgentSession, ToolCall) — framework complexity without simplifying the custom work
- AutoGen is Python-first, creating the same language boundary problem as LangChain
- Creator authorship integrity requires human approval at specific checkpoints — autonomous multi-agent collaboration obscures the approval chain

**Why rejected**: Autonomous multi-agent collaboration without human checkpoints contradicts the system's authorship integrity requirement. The Syntropy agents are assistants that produce drafts for human approval, not autonomous systems that complete tasks end-to-end.

## Consequences

### Positive

- The `ILLMAdapter` interface provides complete vendor independence — switching from Anthropic to OpenAI (or adding a third model) is a configuration change, not an architectural change.
- Custom orchestration gives full observability: every `AgentSession`, `ToolCall`, and `AgentMemory` entry is a first-class domain entity that can be audited, debugged, and analyzed.
- The domain-native `AIAgent` registry means agent definitions are versioned, auditable domain artifacts — consistent with the ecosystem's "everything is a verifiable artifact" philosophy.
- AI-generated content marking is enforced at the domain level — not a UI convention — making it impossible for unapproved AI content to reach publication.

### Negative

- More custom code than a framework-based approach: tool definition, prompt assembly, memory retrieval, and context assembly are all custom implementations.
  - **Mitigation**: The AI Agents domain is classified as a Core Domain for orchestration specifically because these are differentiated capabilities. The investment is justified. Utility functions (token counting, prompt truncation, JSON schema validation for tool outputs) can be extracted to `packages/shared/ai-utils/`.
- LLM API costs scale with usage; heavy agent use could become expensive.
  - **Mitigation**: Token budget enforcement per agent invocation (configurable in `AIAgent.activationPolicy`). Caching of `UserContextModel` assembly (expensive cross-domain query) with a short TTL. Monitoring of per-model token usage as a standard metric.

### Neutral

- Choosing both Anthropic and OpenAI as supported providers means maintaining two adapter implementations and testing both. This is acceptable given the model differentiation strategy (long-form generation vs. tool use).
- The decision to mark AI-generated content is a data model commitment. Once published artifacts carry `ai_generated: true`, this information becomes part of the artifact's permanent record — which is by design.

## Implementation Notes

### AI-Generated Content Fields

Applied to: `Fragment` (Learn), `Review` (Labs), `Contribution` (Hub), `Article` (Labs)

```typescript
interface AIAssistanceMetadata {
  ai_assisted: boolean;                    // was AI assistance used at all?
  ai_generated_sections: string[];         // which sections were AI-generated
  ai_model_used: string | null;            // e.g., "claude-3-5-sonnet-20241022"
  human_reviewed_at: Timestamp | null;
  human_reviewer_id: UserId | null;
}
```

### Agent Definition Schema

```typescript
interface AIAgent {
  id: AgentId;
  name: string;                   // e.g., "fragment-author-agent"
  version: string;                // semver
  pillar: 'learn' | 'hub' | 'labs' | 'cross-pillar';
  systemPrompt: string;           // versioned; changes require new version
  toolSet: ToolReference[];       // tools this agent can invoke
  activationPolicy: {
    maxTokens: number;
    temperatureRange: [number, number];
    preferredModel: string;       // default model for this agent
  };
}
```

## References

- Vision Document: Section 12 (Capability 12: AI Agents); Section 10 (AI-generated content must be marked)
- `docs/architecture/domains/ai-agents/ARCHITECTURE.md` — AI Agents domain design
- `docs/architecture/domains/ai-agents/subdomains/orchestration-context-engine.md` — UserContextModel and orchestration
- `docs/architecture/domains/ai-agents/subdomains/agent-registry-tool-layer.md` — Agent registry and tool definitions
- ADR-001: Modular Monolith — TypeScript-first constraint

## Derived Rules

- `architecture.mdc`: ARCH-012 — `ILLMAdapter` is the required ACL between AI Agents domain and LLM providers
- `architecture.mdc`: ARCH-011 — AI Agents orchestration classified as Core Domain (custom competitive value); agent infrastructure can use off-the-shelf LLM APIs

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | Direct API integration with custom orchestration preserves domain control and observability; LangChain rejected for instability and Python boundary |
