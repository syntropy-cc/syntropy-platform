# AI Agents

## What are AI agents?

**AI agents** on the Syntropy Platform are registered, versioned assistants that can help you in context: for example, a **Fragment Author Agent** for Learn (drafting fragment content), an **Artifact Copilot** for the Hub, or a **Literature Review Agent** for Labs. They are not generic chatbots; they are wired to **tools** that can read and (with your approval) act on platform data — your portfolio, fragments, issues, articles — so that suggestions and actions are relevant to what you are doing.

## How agents work

1. **Registry** — Each agent is a definition: name, version, **system prompt**, **tool set** (which API capabilities it can call), **activation policy** (when it is offered), and **pillar** (Learn, Hub, Labs, or cross-pillar). Admins can register new agents; the platform ships with a set of built-in agents.
2. **Sessions** — When you want help, you start an **agent session**: you choose (or the system suggests) an agent and a **context entity** (e.g. a fragment ID, an issue ID). The session is scoped to that entity. The orchestration layer builds a **user context model** (portfolio, recent activity, permissions) and passes it to the agent so it can give relevant answers.
3. **Invocation** — You send messages or invoke the agent (e.g. “draft the theory section”). The agent may call **tools** (e.g. read fragment, search tracks). The platform enforces **permission scope**: the agent can only see and do what your role allows. Irreversible actions require explicit human confirmation; the agent never becomes the author of record — you do.
4. **Transparency** — Content that was AI-assisted can be marked (e.g. `ai_assisted: true`); human approval may be required before publishing (e.g. in Learn fragments or Labs articles).

## Key principles

- **Unified context** — The value of agents comes from the shared user model (portfolio, events, permissions), not only from domain knowledge.
- **Assistance, not authorship** — You remain the author; the agent suggests and drafts. You approve before anything is published.
- **Tool scope** — Agents only have access to tools and data that your role allows. The registry defines which tools each agent can use.

## AI agents in practice

In Learn, a track creator might use the Fragment Author Agent to draft problem/theory/artifact text for a fragment, then edit and approve it. In Labs, the Literature Review Agent might search internal and external sources and summarize. In the Hub, the Contribution Reviewer Agent might help maintainers analyze a contribution. In all cases you start a session for a specific context (fragment, issue, article) and interact; the session is tied to that context.

## Related concepts

- **[Portfolio and Events](portfolio-and-events.md)** — The context model is built from events and portfolio.
- **[Learn: Tracks and Fragments](learn-track-fragment.md)** — Fragment Author and related agents operate on fragments.

## See Also

- [AI Agents API](../reference/api/ai-agents.md)
- [API Overview](../reference/api/overview.md)
