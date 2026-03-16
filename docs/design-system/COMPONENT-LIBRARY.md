# Component Library — Syntropy Ecosystem

> **Document Type**: Component Library  
> **Project**: Syntropy Ecosystem  
> **Design System Reference**: `docs/design-system/DESIGN-SYSTEM.md`  
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-006 through DS-009)  
> **Created**: 2026-03-12  
> **Last Updated**: 2026-03-16

---

## Component Index

Implementation aligns with **shadcn/ui** where applicable (style: default, baseColor: neutral, cssVariables, Lucide icons). See [syntropy-cc/syntropy](https://github.com/syntropy-cc/syntropy) for reference.

| Component | Level | Status | File |
|-----------|-------|--------|------|
| [Button](#button) | Atom | ✅ Defined | e.g. `components/ui/button.tsx` (shadcn) |
| [Input](#input) | Atom | ✅ Defined | e.g. `components/ui/input.tsx` (shadcn) |
| [Card](#card) | Atom | ✅ Defined | e.g. `components/ui/card.tsx` (shadcn + variants) |
| [Badge](#badge) | Atom | ✅ Defined | e.g. `components/ui/badge.tsx` (shadcn) |
| [Navbar](#navbar) | Molecule | ✅ Defined | e.g. `components/syntropy/Navbar.tsx` |
| [Footer](#footer) | Molecule | ✅ Defined | e.g. `components/syntropy/Footer.tsx` |
| [Sheet](#sheet) | Molecule | ✅ Defined | Mobile menu; e.g. `components/ui/sheet.tsx` (shadcn) |
| Select | Atom | ⬜ Pending | — |
| FormField | Molecule | ⬜ Pending | — |
| Skeleton | Atom | ⬜ Pending | — |

*(Status: ✅ Defined / 🔵 In Progress / ⬜ Pending. Skeleton needed for portfolio and recommendations loading states.)*

---

## Component Definitions

---

### Button

> **Level**: Atom  
> **Purpose**: Triggers an action or event (submit, navigate, confirm, cancel).

#### Variants

| Variant | Use Case | Style |
|---------|----------|-------|
| `primary` | Main call-to-action; one per view (e.g. "Publish artifact", "Submit contribution", "Create institution") | Filled `--color-action-primary` |
| `secondary` | Secondary actions (e.g. "Cancel", "Back", "Skip") | Outlined `--border-default`, no fill |
| `ghost` | Tertiary actions, navigation (e.g. "View all", "Learn more") | No border, subtle hover background |
| `destructive` | Irreversible or dangerous actions (e.g. "Reject contribution", "Delete") | `--color-error-500` (filled or outlined) |
| `link` | Navigate to another page/section | Looks like a link; underline on hover |
| `icon-only` | When space is limited; text in tooltip or `aria-label` | Icon only; `aria-label` required |

#### Props / Parameters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `primary` \| `secondary` \| `ghost` \| `destructive` \| `link` \| `icon-only` | `primary` | Visual style |
| `size` | `sm` \| `md` \| `lg` | `md` | Button dimensions (use spacing tokens) |
| `disabled` | `boolean` | `false` | Disables interaction |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `type` | `button` \| `submit` \| `reset` | `button` | HTML button type |
| `onClick` | `() => void` | — | Click handler |
| `children` | `ReactNode` | — | Button label or icon |

#### States

| State | Appearance | Notes |
|-------|------------|-------|
| Default | Filled/outlined per variant; `--radius-md` (0.5rem); padding from spacing tokens | |
| Hover | Darker shade; cursor pointer | `--color-action-primary-hover` for primary |
| Focus | Default + `--shadow-focus` | Always visible; never remove focus ring |
| Active (e.g. nav item) | Primary fill + `--shadow-nav-active` (blue tint) | Use for active nav link, selected CTA |
| Disabled | Reduced opacity; cursor not-allowed; `aria-disabled="true"` | |
| Loading | Spinner replaces or precedes label; interaction disabled; `aria-busy="true"` | |

#### Accessibility

- Use native `<button>` element (not `<div>` or `<span>`).
- `aria-disabled="true"` when disabled (preserve focusability for screen readers where appropriate).
- `aria-busy="true"` when loading.
- `icon-only` variant requires `aria-label` (e.g. "Close", "Edit", "Submit").
- Focus ring visible and meeting contrast (DS-003).

#### Usage Examples

```tsx
// Primary (e.g. Publish artifact)
<Button onClick={handlePublish} loading={isPublishing}>
  Publish artifact
</Button>

// Destructive (e.g. Reject contribution)
<Button variant="destructive" onClick={handleReject}>
  Reject contribution
</Button>

// Submit with loading
<Button type="submit" loading={isSubmitting}>
  Submit contribution
</Button>

// Icon only
<Button variant="icon-only" aria-label="Close dialog">
  <CloseIcon />
</Button>
```

#### Do / Don't

| ✅ Do | ❌ Don't |
|-------|----------|
| Use `primary` for the one main action per view | Put two `primary` buttons side by side |
| Use `destructive` for reject, delete, or irreversible actions | Use `destructive` for normal actions |
| Use `loading` during async submit/publish | Leave user with no feedback during submit |
| Keep labels concise (e.g. "Publish", "Submit contribution") | Use long sentences as button text |
| Provide `aria-label` for icon-only buttons | Rely on icon alone without accessible name |

---

### Card

> **Level**: Atom  
> **Purpose**: Container for content blocks: pillar cards on landing, list items, MyST content, and overlays.

#### Variants

| Variant | Use Case | Style |
|---------|----------|-------|
| `default` | Standard content block | `--bg-surface`, `--border-default`, `--radius-md` |
| `glass` | Overlays, nav panels | Glass morphism: `--glass-bg`, `--glass-blur`, `--glass-border` |
| `pillar` | Landing pillar cards (Learn, Projects, Labs, Contribute, Portfolio) | Header with gradient or pillar palette; body neutral; optional mesh/particle background |

#### States

| State | Appearance |
|-------|------------|
| Default | Border, radius, subtle shadow per DESIGN-SYSTEM |
| Hover | Slight lift (e.g. translateY -1px to -2px), increased shadow |
| Optional | Inner shadow for depth on pillar cards |

#### Usage

Use for pillar cards on the landing (Learn, Projects, Labs, Contribute, Portfolio), list cards, and MyST-style content. Reference [syntropy-cc/syntropy](https://github.com/syntropy-cc/syntropy) landing page and `app/page.tsx` for structure.

---

### Badge

> **Level**: Atom  
> **Purpose**: Tags, status labels, and short labels (e.g. "LE", "PJ" pillar badges).

#### Variants

Semantic or pillar-based (primary, success, warning, destructive, or pillar palette). Radius: pill (`--radius-full`). Sizes: `sm`, `md`. Optional glow for emphasis (e.g. CTA badges).

#### Accessibility

Badges that convey status must pair with icon + text where needed; do not rely on color alone.

---

### Navbar

> **Level**: Molecule  
> **Purpose**: Global navigation: logo, primary links (Learn, Projects, Labs), user menu, and mobile menu.

#### Structure

- Logo (e.g. "Syntropy") linking to home.
- Desktop: horizontal links; active item uses `--color-action-primary` and `--shadow-nav-active`; inactive hover uses subtle background (e.g. `bg-white/5` in dark).
- User menu (auth): dropdown or UserMenu component.
- Mobile: Sheet component (slide-out) with same links; close on navigation.

#### Reference

[syntropy-cc/syntropy Navbar](https://github.com/syntropy-cc/syntropy/blob/main/components/syntropy/Navbar.tsx).

---

### Footer

> **Level**: Molecule  
> **Purpose**: Site footer: columns of links, copyright.

#### Structure

Dark background; columns (e.g. Aprenda, Construa, Comunidade) with links; copyright line. Use spacing and typography tokens; no decorative imagery unless specified.

#### Reference

[syntropy-cc/syntropy Footer](https://github.com/syntropy-cc/syntropy/blob/main/components/syntropy/Footer.tsx).

---

### Input

> **Level**: Atom  
> **Purpose**: Single-line text entry (name, email, search, URL, etc.).

#### Variants

| Variant | Use Case |
|---------|----------|
| `default` | Standard text (e.g. pipeline name, project name, article title) |
| `password` | Masked password entry |
| `search` | Search/filter inputs (e.g. cross-pillar search) |
| `email` | Email (sign-up, login) |
| `number` | Numeric entry where applicable |

#### Props / Parameters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `text` \| `password` \| `email` \| `search` \| `number` \| `url` | `text` | Input type |
| `value` | `string` | — | Controlled value |
| `placeholder` | `string` | — | Placeholder (never substitute for label) |
| `disabled` | `boolean` | `false` | Disables input |
| `readOnly` | `boolean` | `false` | Non-editable display |
| `error` | `boolean` | `false` | Shows error styling |
| `id` | `string` | — | Required for `<label>` association |
| `aria-invalid` | `boolean` | — | Set when error; ties to `aria-describedby` for error message |
| `aria-describedby` | `string` | — | ID of error or helper text |

#### States

| State | Appearance |
|-------|------------|
| Default | Border `--border-default`; padding `--space-3`; radius `--radius-sm` |
| Focus | Border `--color-action-primary`; `--shadow-focus` |
| Filled | Same as default (optional subtle border change) |
| Error | Border `--color-error-500`; error icon + message below (via FormField) |
| Disabled | Reduced opacity; cursor not-allowed; bg `--color-neutral-100` |
| Read-only | Bg `--color-neutral-50`; no focus ring |

#### Accessibility

- Always paired with `<label>` via matching `id` and `htmlFor`.
- Never use placeholder as the only label.
- Error: `aria-invalid="true"` and `aria-describedby` pointing to error text element.
- Required: `required` attribute and visual indicator (e.g. asterisk); legend at form top if needed.

#### Usage Example

```tsx
<FormField label="Project name" required error={errors.name?.message}>
  <Input
    id="project-name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g. my-open-source-app"
    error={!!errors.name}
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? "project-name-error" : undefined}
  />
</FormField>
```

#### Do / Don't

| ✅ Do | ❌ Don't |
|-------|----------|
| Use with FormField for label + error placement | Use Input without a visible label |
| Show error message in text (icon + text) | Convey error by color only |
| Use spacing and color tokens from design system | Hardcode px or hex in component |

---

### FormField (Placeholder)

> **Level**: Molecule  
> **Purpose**: Wraps an input (or Select, Textarea) with label, optional helper text, and error message.  
> **Status**: ⬜ Pending — structure to be implemented per INTERACTION-DESIGN form patterns (label above, error below, required indicator).

---

### Skeleton (Placeholder)

> **Level**: Atom  
> **Purpose**: Loading placeholder for portfolio cards, recommendation blocks, list rows, and fragment content.  
> **Status**: ⬜ Pending — use shimmer animation per DESIGN-SYSTEM motion; no hardcoded dimensions; use spacing tokens for height/width where fixed size is needed.

---

### MyST (Educational Content)

When rendering educational or documentation content (e.g. Learn pillar, Labs articles), the **MyST** pattern can be used:

- **Grid**: Responsive grid (1–4 columns by breakpoint) with gap and animation (e.g. fadeInUp with stagger).
- **Cards**: `myst-card` using design tokens (`--card`, `--border`, `--radius`); optional header variants (primary, success, info, warning, danger).
- **Admonitions**: tip, note, warning, danger, cta-action; left border and optional background tint from semantic tokens.
- **Dropdowns**: Collapsible content with trigger; variants (success, info, warning, danger) for content tint.

All MyST styles should use design system tokens (`--card`, `--border`, `--primary`, `--muted`, etc.) and respect dark/light theme. Reference syntropy-cc/syntropy `styles/myst-grid-components.css` and `components/myst` for implementation patterns.

---

## Deprecated Components

| Component | Deprecated Since | Replacement | Removal Date |
|-----------|------------------|-------------|--------------|
| (None) | — | — | — |
