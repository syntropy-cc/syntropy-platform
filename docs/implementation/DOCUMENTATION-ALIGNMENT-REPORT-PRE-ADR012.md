# Documentation-Architecture Alignment Report (Pre-Change Baseline — ADR-012)

> **Skill**: Documentation-Architecture Alignment (SKL-DOCAL)
> **Report Date**: 2026-03-16
> **Mode**: Post-generation
> **Architecture Source**: docs/architecture/ARCHITECTURE.md
> **Documentation Source**: docs/user/
> **Context**: Prompt 08c evolution baseline before applying ADR-012 documentation updates

---

## Executive Summary

| Category | Count |
|----------|-------|
| Architecture items requiring documentation | 40+ |
| Undocumented items (coverage gap) | 0 (docs exist) |
| Phantom documentation files | 0 |
| Stale documentation conflicts (ADR-012 related) | 2 |
| Terminology mismatches (ADR-012 related) | 1 |
| Diataxis structure violations | 0 |

**Overall Alignment**: MINOR GAPS (ADR-012 terminology and entry-flow clarity; no phantom docs).

---

## ADR-012 Related Findings (Pre-Change)

### Stale / Misaligned (user docs vs ADR-012)

| File | Section | Architecture Says (ADR-012) | Documentation Says | Severity |
|------|---------|-----------------------------|--------------------|----------|
| docs/user/reference/api/overview.md | Endpoint prefixes table | Platform is technical foundation only; not a user-facing product surface. API area for portfolio/search/recommendations should not be labeled "Platform Core". | Domain label "Platform Core" for `/api/v1/portfolios/*`, `/api/v1/search`, `/api/v1/recommendations/*` | Medium |
| docs/user/reference/api/portfolios-search.md | Intro line 1 | Same as above. | "Platform Core: user portfolio..." | Medium |

### Terminology (ADR-012)

| Documentation File | Term Used | Canonical / Preferred | Location |
|-------------------|-----------|----------------------|----------|
| reference/api/overview.md, reference/api/portfolios-search.md | "Platform Core" (as product/area name) | "Portfolio, Search & Recommendations" or "core services" | Table and intro |

### Entry flow (ADR-012)

- **Architecture**: Users enter via institutional site (home) → login/signup → application (Learn, Hub, Labs, dashboard). Single web application; no "Platform" page or section.
- **Documentation**: index.md and getting-started do not explicitly state "institutional home as entry"; quick-start says "Open the platform URL" without framing institutional home. No incorrect "Platform" destination; entry flow could be clearer.

---

## 3. Phantom Documentation

No phantom documentation found. No docs describe a "/platform" route or "Platform" as a fourth pillar.

---

## 4. Recommended Actions (Pre-Change)

1. **reference/api/overview.md**: Change "Platform Core" to "Portfolio, Search & Recommendations" in Endpoint prefixes table.
2. **reference/api/portfolios-search.md**: Change "Platform Core:" to "Portfolio, search, and recommendations (core services):" in first line.
3. **index.md**: Add one sentence on entry flow (institutional home → sign in → Learn, Hub, Labs, dashboard).
4. **getting-started/quick-start.md**: Clarify step 1: land on institutional home (or app URL), then sign in; after sign-in, reach Learn, Hub, Labs, or dashboard.
5. **getting-started/installation.md**: Replace "platform web app" / "platform app" with "web app" or "single web application" where it implies a "Platform" section; e.g. "Open the web app (institutional home or login page)".

---

## Baseline for Post-Change Comparison

- **Stale conflicts (ADR-012)**: 2 (both "Platform Core" labeling).
- **Entry flow**: Not explicitly stated in index/quick-start.
- **Phantom**: 0.

After applying the plan, re-run alignment and expect: 0 ADR-012 stale conflicts, entry flow stated, alignment ALIGNED or MINOR GAPS.
