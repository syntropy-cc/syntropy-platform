# ADR-011: Rename HackinDimension to ContributionSandbox and Clarify Definition

## Status

Proposed

## Date

2026-03-13

## Context

The Hub domain currently defines **HackinDimension** as "a structured, time-bounded collaborative event organized around a specific problem or challenge." This name and definition do not clearly communicate what the concept does at the mechanism level.

In practice, the concept encapsulates the manual steps of contributing to a project: it provides a safe, isolated environment (instance or container, e.g. Docker) where the system clones an artifact, the contributor can change whatever they want and see the effects, and optionally submit a pull request that may be accepted or rejected. This applies to all DIP artifact types (code, documents, data, etc.), not only code. The mechanism must be available to every contributor who has access to the artifact — including owners and authorized contributors on private or closed projects — not only to "open" or open-source artifacts. Visibility (public vs private) does not restrict the mechanism; access permission does.

Renaming and redefining the concept in the architecture will align documentation with intended behavior and avoid the misconception that the contribution sandbox is limited to open-source projects.

## Decision

We will rename **HackinDimension** to **ContributionSandbox** across Hub architecture documentation and clarify the definition as follows:

1. **Name**: Use **ContributionSandbox** in the ubiquitous language and in all architecture documents. Technical identifiers (event names, schema fields such as `hackin_dimension_id`) may remain unchanged in this iteration to avoid breaking consumers; alignment of technical naming can follow in a later change.

2. **Definition**: ContributionSandbox is the mechanism that encapsulates the contribution workflow:
   - Creates an isolated instance (or container, e.g. Docker) so changes are safe and do not affect the main project.
   - Clones the artifact into that instance; the contributor edits as desired and sees the effects of their changes.
   - Optionally, the contributor may submit a pull request; the maintainer accepts or rejects it.
   - Applies to **all DIP artifacts** (code, documents, data, etc.), not only code.
   - Available to **every contributor who has access to the artifact** — including owners and authorized contributors on private or closed projects. Visibility (public vs private) does not restrict the mechanism; access permission does.

3. **Scope**: This decision is documentation-only (architecture and context docs). No code or API contract changes are required in this iteration; event names `hub.hackin.*` and field names like `hackin_dimension_id` may be retained for backward compatibility.

## Alternatives Considered

### Alternative 1: Keep HackinDimension with improved definition only

Keep the name "HackinDimension" and only expand the definition to describe the sandbox/clone/edit/PR flow and access rule.

**Pros**:
- No renaming effort; no risk of confusion during transition.
- "Hackin" remains aligned with Vision capability 30 title ("Hackin Dimension per Project").

**Cons**:
- The name still does not convey the mechanism (sandbox, safe contribution environment).
- "Dimension" suggests a parallel space rather than the concrete workflow (clone → edit → PR).

**Why rejected**: The plan explicitly requests a name that reflects the function; ContributionSandbox is clearer for readers of the architecture.

### Alternative 2: ContributionWorkspace

Use "ContributionWorkspace" instead of "ContributionSandbox."

**Pros**:
- Neutral term; "workspace" is familiar in IDEs and collaboration tools.

**Cons**:
- Does not emphasize isolation and safety (sandbox) as strongly.
- Vision already uses "sandbox" for this concept.

**Why rejected**: ContributionSandbox better conveys the isolated, safe environment and aligns with Vision vocabulary.

### Alternative 3: Do Nothing

Leave HackinDimension name and current definition as-is.

**Pros**:
- No documentation churn.

**Cons**:
- Misalignment between documentation and intended behavior; risk that implementers or readers assume the mechanism applies only to "open" or open-source artifacts.
- Name does not reflect the actual mechanism.

**Why rejected**: The imprecision and naming gap were explicitly called out and need to be addressed.

## Consequences

### Positive

- Architecture documentation clearly describes the contribution sandbox mechanism (isolated instance, clone, edit, optional PR) and its scope (all DIP artifacts; all contributors with access).
- The name ContributionSandbox reflects the function and aligns with Vision's "sandbox" language.
- Reduces risk of misinterpretation (e.g. that the mechanism is only for open-source or public artifacts).

### Negative

- Temporary divergence between documentation terminology (ContributionSandbox) and technical identifiers (`hub.hackin.*`, `hackin_dimension_id`) until a follow-up change aligns them.
  - **Mitigation**: Document in this ADR that technical naming is retained for compatibility; plan optional follow-up for event/schema rename.
- Vision document and some context docs may still use "Hackin" or "Hackin Dimension"; traceability is preserved via capability 30.
  - **Mitigation**: Update Vision concept table and optional references to use ContributionSandbox where appropriate.

### Neutral

- Traceability to Vision capability 30 ("Hackin Dimension per Project") remains; the capability title can stay for historical consistency while the implementation concept is named ContributionSandbox.

## Implementation Notes

- Update Hub domain architecture and Collaboration Layer subdomain with new name and full definition (including access rule: available to all contributors who can access the artifact).
- Update root architecture, CHANGELOG, diagrams README, architecture-brief, generation-summary, and platform-core references.
- Optionally update Vision concept table for Hub (ContributionSandbox, with clarification on access).
- Do not change event payloads or API contracts in this iteration unless explicitly scoped in a follow-up.

## References

- Vision: Capability 30 — Hackin Dimension per Project (§30).
- [Hub Domain Architecture](../domains/hub/ARCHITECTURE.md)
- [Collaboration Layer Subdomain](../domains/hub/subdomains/collaboration-layer.md)

## Derived Rules

None. This ADR refines naming and definition within existing architecture; no new rules in `.mdc` files are required.
