# ADR-012: Platform as Technical Foundation Only; Institutional Site as System Home

## Status

Accepted

## Date

2026-03-16

## Context

The architecture currently treats "Platform" in a way that can be misinterpreted as a fourth user-facing pillar alongside Learn, Hub, and Labs. This has led to:

- A dedicated `/platform/*` route in the web application for "cross-pillar" features (portfolio dashboard, search, recommendations, planning, settings), presented as a peer to `/learn`, `/hub`, and `/labs`.
- System context diagrams that show "Syntropy Platform" as a box alongside the three pillar apps, suggesting it is a product surface rather than infrastructure.
- Ambiguity about whether the institutional site is the main entry point of the system or a separate public site.

In reality:

- **Platform** is the technical foundation: infrastructure, shared services, base code, and integration mechanisms that enable the three pillars. It is not a functional pillar and must not be represented as a page or section of the application.
- The **three functional pillars** exposed to users are **Learn**, **Hub**, and **Labs** only.
- The **institutional site** should function as the main entry point of the ecosystem (GitHub-style): it presents the ecosystem, explains the pillars, provides institutional content (e.g. contribution, portfolio, community), and offers login, signup, and access to the application. After authentication, users reach the application areas (Learn, Hub, Labs) — there is no separate "Platform" area.
- The system should be delivered as **one web application**: the landing is the institutional home; the application is the authenticated area with Learn, Hub, Labs, and a shared user area (e.g. dashboard) for cross-pillar features.

If we do not decide, documentation and implementation will continue to treat Platform as a user-facing pillar, increasing confusion and inconsistent UX.

## Decision

We will define and document the following:

1. **Platform** is exclusively the technical foundation of the ecosystem. It comprises infrastructure, shared services (e.g. event bus, portfolio aggregation, search), base code, and integration mechanisms. It must not be represented as a user-facing pillar or as a dedicated route or section of the application (e.g. no `/platform` as a peer to `/learn`, `/hub`, `/labs`).

2. **Three functional pillars** — Learn, Hub, Labs — are the only pillar areas exposed to users. Cross-pillar features (portfolio dashboard, search, recommendations, planning board, settings) are provided via a **shared user area** (e.g. `/dashboard` or `/me`), not under a route named "platform".

3. **Institutional site** is the **main entry point** of the system (GitHub-style). It presents the ecosystem, explains the three pillars, shows institutional information (e.g. contribution, portfolio, community), and provides login, signup, and access to the application. It is part of (or the public face of) the single web application. After authentication, users access Learn, Hub, Labs (and the shared user area); there is no separate "Platform" page.

4. **Single web application**: The system is delivered as one application. The home page is the institutional site; the application areas are Learn, Hub, Labs, plus the shared user area and admin. Diagrams and documentation will show one user-facing application boundary, not "Platform" as a fourth app.

**Explicitly out of scope**: This ADR does not prescribe the exact route prefix for the shared user area (e.g. `/dashboard` vs `/me`); that is an implementation choice. It does require that no route be named "platform" for user-facing pillar-like content.

## Alternatives Considered

### Alternative 1: Keep Platform as a Fourth Pillar Route

Retain `/platform/*` as a dedicated route for cross-pillar features and keep "Syntropy Platform" as a box in context diagrams alongside Learn, Hub, Labs.

**Pros**:
- No documentation or code changes.
- Clear separation of "cross-pillar" vs "pillar" features.

**Cons**:
- Reinforces the misconception that Platform is a product surface.
- Inconsistent with the intended model: Platform = foundation, not pillar.

**Why rejected**: It perpetuates the conceptual error and contradicts the desired UX (institutional home + three pillars only).

### Alternative 2: Rename "Platform" Route to "Dashboard" Only (No Institutional Reframe)

Replace `/platform` with `/dashboard` but leave the institutional site described as a separate public read layer.

**Pros**:
- Removes the "Platform" route name.
- Smaller change set.

**Cons**:
- Does not establish the institutional site as the main entry point or clarify the single-application model.
- Incomplete alignment with the GitHub-style home and one-app structure.

**Why rejected**: The evolution request explicitly requires the institutional site to be the main page and entry to the application; renaming the route alone is insufficient.

### Alternative 3: Do Nothing

Leave architecture as-is: Platform as a fourth box, `/platform` route, institutional site as a separate public layer.

**Pros**:
- No implementation effort.
- No risk of documentation drift from code during transition.

**Cons**:
- Conceptual confusion remains (Platform as pillar vs foundation).
- Institutional site is not positioned as the system home.
- New contributors and product will continue to treat Platform as a user-facing area.

**Why rejected**: The current state is explicitly incorrect per stakeholder direction; leaving it unchanged is not acceptable.

## Consequences

### Positive

- Clear separation between "Platform" (foundation) and "Platform Core" (domain): Platform = infra; Platform Core = domain owning event bus, portfolio, search.
- Consistent UX model: one entry (institutional home), three pillars (Learn, Hub, Labs), plus shared user area — no fourth "Platform" area.
- Documentation and diagrams align with the intended mental model and reduce onboarding confusion.
- Institutional site has a defined role as the main entry point, improving product and design alignment.

### Negative

- Implementation and component records (e.g. COMP-032, COMP-036) will need updates in a follow-up phase to remove `/platform` routing and adopt the shared user area prefix.
  - **Mitigation**: Evolution Impact Plan will list all required implementation and user-doc changes for Phase 9b and 9c.
- Some existing references to "platform" as a pillar or route may remain in implementation docs until Phase 9b.
  - **Mitigation**: Propagation checklist and Evolution Impact Plan ensure traceability.

### Neutral

- The shared user area (dashboard/me) still exposes portfolio, search, recommendations, planning, settings; only the route name and conceptual framing change, not the features themselves.
- Platform service documents (REST API, background services, embedded IDE, institutional site) remain; their descriptions and positioning are updated to match the new model.

## Implementation Notes

### Phase 1: Architecture documentation (Prompt 08a)

- Update root ARCHITECTURE.md (system purpose, context diagram, domain overview note, modular monolith, platform services).
- Update platform/web-application/ARCHITECTURE.md (remove `/platform` route; add shared user area; update diagram).
- Update platform/institutional-site/ARCHITECTURE.md (reframe as main entry; entry flow; single app).
- Update diagrams/README.md if diagram descriptions reference "pillar apps" or "Platform" as fourth app.
- Add ARCH-013 to architecture.mdc; reference ADR-012.
- Changelog entry under [Unreleased].
- Produce Evolution Impact Plan for 08b and 08c.

### Phase 2: Implementation documentation (Prompt 08b)

- Update component records (e.g. COMP-032, COMP-036) and Implementation Plan per Evolution Impact Plan.
- Remove or redirect `/platform` route; adopt shared user area prefix (e.g. `/dashboard` or `/me`).

### Phase 3: User documentation (Prompt 08c)

- Update user-facing docs to describe entry flow (institutional home → login/signup → app) and three pillars only; remove references to a "Platform" page or section.

### Migration Considerations

- No data migration. This is a documentation and routing/naming change.
- Backward compatibility: If existing links to `/platform/*` exist, redirects to the new shared user area (e.g. `/dashboard`) should be added in implementation phase.
- Rollback: Revert ADR (mark Superseded), revert architecture and rule edits, revert CHANGELOG; no API or data rollback.

## References

- Related ADRs: [ADR-001 (Modular monolith)](./ADR-001-modular-monolith.md)
- Root architecture: [ARCHITECTURE.md](../ARCHITECTURE.md)
- Web application architecture: [platform/web-application/ARCHITECTURE.md](../platform/web-application/ARCHITECTURE.md)
- Institutional site architecture: [platform/institutional-site/ARCHITECTURE.md](../platform/institutional-site/ARCHITECTURE.md)

## Derived Rules

- `architecture.mdc`: ARCH-013 — Platform is technical foundation only; must not be represented as a user-facing pillar or route; three functional pillars are Learn, Hub, Labs.

---

## Review History

| Date       | Reviewer | Decision | Notes |
|-----------|----------|----------|-------|
| 2026-03-16 | Evolution Coordinator | Accepted | Architecture evolution per plan; derived rule ARCH-013 added. |
