# ADR-013: Design System UI Library Compliance Refactor

## Status

Accepted

## Date

2026-03-17

## Context

The Syntropy design system is fully specified in `docs/design-system/` — tokens, component specs, visual direction, pillar profiles, interaction patterns, and a responsive system. This documentation was produced during Phase 2b (UX/Interaction Design) and represents the authoritative specification for all visual implementation.

The shared UI library at `packages/ui` (published as `@syntropy/ui`) is the implementation vehicle for that specification. It is consumed by `apps/platform`, `apps/learn`, `apps/hub`, and `apps/labs`. Every page rendered in the Syntropy ecosystem is built from these components.

The current state of `packages/ui` does not implement the design system:

**Token layer gap (Critical)**:
- `packages/ui/src/styles/tokens.css` — declared as the canonical CSS file in `DESIGN-TOKENS.md` — does not exist.
- `packages/ui/src/theme.css` defines HSL-based variables (`--background`, `--primary`, etc.) using names and values incompatible with the token system. The primary color in light mode resolves to near-black; in dark mode to blue — neither is the specified teal-esmeralda `#0FA87F`.
- Semantic tokens are absent: `--action-primary`, `--bg-surface`, `--bg-surface-raised`, `--border-focus`, `--focus-ring`, all pillar tokens.
- Deprecated glass-morphism variables (`--glass-bg`, `--glass-border`, `--gradient-hero`) are present, contradicting `COMPONENT-LIBRARY.md` which marks the glass variant as deprecated.
- `tailwind.config.ts` extends only five color aliases (`border`, `background`, `foreground`, `muted`, `accent`, `primary`) via `hsl(var(...))`. The full DESIGN-TOKENS Section 7 mapping — including the primary scale, semantic surfaces, pillar accents, and semantic state colors — is absent.

**Component gap (Critical/Major)**:
- Button: missing variants `primary`, `destructive`, `link`, `icon-only`; no `loading` state or `aria-busy`; incorrect focus ring implementation; sizes do not match the specified 32/40/48px.
- Card: variants are `default`/`glass`/`pillar`; the specification defines `default`/`elevated`/`interactive`/`sunken`; `glass` is deprecated; `pillar` uses hardcoded hex gradients instead of pillar tokens; `CardTitle` uses `font-semibold` (weight 600) which violates the two-weight constraint (400/500 only).
- Badge: uses Tailwind utility opacity classes (`emerald-500/15`) instead of design tokens; contains variants `contribute` and `portfolio` that do not exist in `COMPONENT-LIBRARY.md`; padding, font size, and font weight diverge from spec.
- Sheet: backdrop uses `bg-black/50` instead of `--bg-overlay`; slide-in animation is absent; width diverges from spec.
- 21 components specified in `COMPONENT-LIBRARY.md` are entirely absent from `packages/ui`: Input, Textarea, Select, Checkbox, Switch, Avatar, Skeleton, ProgressBar, Tooltip, FormField, StatCard, TabBar, Dialog, Toast, DropdownMenu, Breadcrumb, EmptyState, PageHeader, EntityHeader, ListRow, PillarBadge.

**Downstream impact**: Because all pillar apps depend on `@syntropy/ui`, every page in the system does not conform to the design system. Token-level violations (wrong primary color, missing semantic tokens) propagate to every rendered element. Apps currently use non-spec patterns: `Card variant="pillar" pillarHeader="learn"`, `Badge variant="learn"`, and inline Tailwind classes for buttons instead of the Button component.

The design system documentation is internally consistent and correct. The gap is entirely in the implementation layer.

## Decision

We will refactor `packages/ui` to full design system compliance. Specifically:

1. **Canonical token file**: Create `packages/ui/src/styles/tokens.css` implementing all three token layers from `DESIGN-TOKENS.md`: primitive (color scales, typography, spacing), semantic (text, surfaces, borders, actions, focus), and pillar (contextual overrides for Learn, Hub, Labs). Include the shadcn/ui variable bridge (Section 7.2). Replace `theme.css` with an import of `tokens.css`.

2. **Tailwind extension**: Update `packages/ui/tailwind.config.ts` to implement the full DESIGN-TOKENS Section 7.1 mapping — primary scale, pillar accents, semantic surfaces, semantic text, semantic state colors (success, error, warning, info), border, and all radius aliases.

3. **Refactor existing components**: Align Button, Card, Badge, and Sheet to their `COMPONENT-LIBRARY.md` specifications — correct variants, correct tokens, correct typography weights, all required interaction states including `loading`, and the design-system focus ring.

4. **Add missing components**: Implement the 21 components specified in `COMPONENT-LIBRARY.md` but absent from `packages/ui`, prioritized by dependency order and cross-pillar usage frequency.

5. **Migrate consuming apps**: Update `apps/platform`, `apps/learn`, `apps/hub`, and `apps/labs` to use the new component API, replacing deprecated variants and inline button styles.

The scope of this decision is `packages/ui` and its consumers. The design system documentation itself (`docs/design-system/`) is not changed — it is already correct.

## Alternatives Considered

### Alternative 1: Incremental patch without canonical token file

Patch individual components to use better class names without introducing `tokens.css`.

**Pros**:
- Lower initial effort — no token file migration required.
- No breaking changes for consumers.

**Cons**:
- Does not establish the token foundation. Components would still hardcode or approximate values instead of referencing the three-layer system.
- Future components would have no token reference to follow, recreating the same drift problem.
- The gap between `DESIGN-TOKENS.md` specification and implementation would remain; documentation-to-code traceability would be impossible.

**Why rejected**: Tokens are the architectural foundation of the design system. Without `tokens.css`, the component library cannot be token-compliant regardless of how well individual components are written. This alternative defers the core problem indefinitely.

### Alternative 2: Move components into each pillar app

Each pillar app (`apps/learn`, `apps/hub`, `apps/labs`) maintains its own component library.

**Pros**:
- Maximum pillar autonomy — each pillar can diverge freely.
- No shared-library breaking change coordination required.

**Cons**:
- Violates the architectural principle of a shared UI library (COMP-032 depends on `packages/ui` as a shared foundation).
- Duplicates all component implementations across three apps — high maintenance cost.
- Makes pillar-to-pillar visual consistency impossible to enforce.
- Does not solve the token compliance problem; it moves it to three places.

**Why rejected**: The monorepo architecture explicitly designs `packages/ui` as the shared UI foundation. Distributing components to apps would undermine cross-pillar consistency, which is a core product requirement ("the ecosystem feels like one product with contextual variations").

### Alternative 3: Do Nothing

Continue with the current `packages/ui` state.

**Pros**:
- No implementation effort.
- No risk of breaking changes.

**Cons**:
- All pages in the system use the wrong primary color (not teal-esmeralda), wrong typography weights (font-semibold/600), and wrong component semantics.
- The design system documentation is rendered meaningless — it specifies a system that does not exist in the codebase.
- 21 components required for pillar features (forms, dialogs, empty states, navigation patterns) are missing, blocking pillar UI implementation.
- Technical debt compounds: new components added to `packages/ui` without a token foundation will continue to diverge from the spec.

**Why rejected**: The design system specification was produced as the authoritative visual architecture for the product. An implementation that ignores it produces inconsistent, inaccessible, and brand-incorrect UI. This is unacceptable for a product in active development heading toward release.

## Consequences

### Positive

- All pages rendered by the system will use the correct teal-esmeralda primary color and full semantic token system after migration.
- Component library becomes a complete, WCAG 2.1 AA-compliant implementation of the design system specification — all 28 components from `COMPONENT-LIBRARY.md` will be present.
- Pillar apps will be able to override `--pillar-accent` and related tokens to provide contextual identity (amber for Learn, slate for Hub, indigo for Labs) without breaking the primary action color system.
- `DESIGN-TOKENS.md` and `COMPONENT-LIBRARY.md` become executable specifications — any developer or AI agent can read the design system docs and know exactly what the code does.
- Token-based dark mode will work correctly across all components (currently dark mode resolves to blue, not the specified dark-mode palette).

### Negative

- Breaking changes for apps consuming the current non-spec API:
  - **Mitigation**: Comprehensive migration guide in the DS Evolution Impact Plan (`docs/design-system/evolution/ds-impact-ADR-013.md`) with explicit find-replace patterns for each breaking change.
- Card `glass` variant is removed (deprecated since 2026-03-16):
  - **Mitigation**: Replace with `elevated` variant which achieves the same visual elevation via shadow.
- Badge variants `contribute` and `portfolio` are removed (not in spec):
  - **Mitigation**: Use `PillarBadge` for pillar identification; use semantic variants (`success`, `warning`, `error`, `info`) for state communication.
- Button API changes (variant names align to spec):
  - **Mitigation**: `default` → `primary`; `outline` → `secondary`; API is otherwise unchanged.

### Neutral

- `theme.css` is replaced by an import of `tokens.css`. Apps that import `@syntropy/ui/styles` will receive the new token set automatically.
- shadcn/ui base components (used implicitly through CVA patterns) continue to work — their CSS variable bridge (`--background`, `--foreground`, etc.) is remapped in `tokens.css` Section 7.2 rather than removed.
- The implementation is tracked as COMP-041 (Design System UI Library) in `docs/implementation/`, providing full traceability from design system spec to code.

## Implementation Notes

### Phase 1: Token Foundation (COMP-041.1–COMP-041.2)

- Duration: 1 session
- Scope: Create `tokens.css` with all three token layers and Section 7.2 bridge; update `tailwind.config.ts` per Section 7.1.
- Verification: `packages/ui` builds; all existing component tests still pass; the teal primary color `#0FA87F` renders in browser.

### Phase 2: Refactor Existing Components (COMP-041.3–COMP-041.6)

- Duration: 1–2 sessions
- Scope: Button, Card, Badge, Sheet aligned to spec.
- Verification: Component tests updated and passing; Storybook (if present) or visual review confirms correct colors, weights, focus rings, and loading states.

### Phase 3: Add Missing Components — Critical/High Priority (COMP-041.7–COMP-041.11)

- Duration: 2–3 sessions
- Scope: Input, Textarea, Select, Checkbox, Switch, Avatar, PillarBadge, Skeleton, ProgressBar, Tooltip, FormField.
- Verification: Each component renders correctly in all required states (default, hover, focus, error, disabled, loading where applicable).

### Phase 4: Add Missing Components — Medium Priority (COMP-041.12–COMP-041.17)

- Duration: 2 sessions
- Scope: Dialog, Toast, DropdownMenu, Breadcrumb, StatCard, EmptyState, TabBar, PageHeader, EntityHeader, ListRow.
- Verification: Each renders correctly; EmptyState and error states are present in all applicable list/grid pages.

### Phase 5: Consumer Migration (COMP-041.18)

- Duration: 1 session
- Scope: Update all consuming apps to use the new component API.
- Verification: All app builds succeed; no deprecated variant names in codebase; visual regression check on key pages.

### Phase 6: Test Coverage (COMP-041.19)

- Duration: 1 session
- Scope: Unit tests for all new and refactored components.
- Verification: Test suite passes; coverage meets 80% threshold for `packages/ui`.

### Migration Considerations

**Breaking changes requiring find-replace in consuming apps**:

| Old Usage | New Usage |
|-----------|-----------|
| `<Card variant="glass">` | `<Card variant="elevated">` |
| `<Card variant="pillar" pillarHeader="learn">` | `<Card variant="default"> + <PillarBadge pillar="learn">` |
| `<Badge variant="learn">` | `<Badge variant="pillar">` (with pillar context) or `<PillarBadge pillar="learn">` |
| `<Badge variant="contribute">` | `<Badge variant="primary">` |
| `<Badge variant="portfolio">` | `<Badge variant="default">` |
| `<Button variant="default">` | `<Button variant="primary">` |
| `<Button variant="outline">` | `<Button variant="secondary">` |
| Inline `className="...bg-primary text-primary-foreground..."` links | `<Button variant="primary" asChild><Link>...</Link></Button>` |

## References

- Design Tokens specification: [`docs/design-system/DESIGN-TOKENS.md`](../../design-system/DESIGN-TOKENS.md)
- Component Library specification: [`docs/design-system/COMPONENT-LIBRARY.md`](../../design-system/COMPONENT-LIBRARY.md)
- Visual Direction: [`docs/design-system/VISUAL-DIRECTION.md`](../../design-system/VISUAL-DIRECTION.md)
- Pillar Profiles: [`docs/design-system/PILLAR-PROFILES.md`](../../design-system/PILLAR-PROFILES.md)
- DS Evolution Impact Plan: [`docs/design-system/evolution/ds-impact-ADR-013.md`](../../design-system/evolution/ds-impact-ADR-013.md)
- Component record: [`docs/implementation/components/COMP-041-design-system-ui-library.md`](../../implementation/components/COMP-041-design-system-ui-library.md)
- Web Application component: [`docs/implementation/components/COMP-032-web-application.md`](../../implementation/components/COMP-032-web-application.md)

## Derived Rules

- `design-system.mdc`: DS-002 through DS-011 apply to `packages/ui` as the canonical implementation target. `packages/ui/src/styles/tokens.css` is the authoritative CSS file for all design tokens.
- `constraints.mdc`: CON-001 — `packages/ui` is the only source for UI components across all apps. No app may define duplicate component implementations for components present in `packages/ui`.

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-17 | System Architect | Accepted | Refactoring `packages/ui` to full DS compliance; breaking changes documented in DS Evolution Impact Plan. |
