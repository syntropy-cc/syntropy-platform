# Component Library — {Project Name}

> **Document Type**: Component Library
> **Project**: {Project Name}
> **Design Tokens Reference**: `docs/design-system/DESIGN-TOKENS.md`
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-006 through DS-009)
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}

---

## Component Index

| Component | Level | Status | File | Responsive |
|-----------|-------|--------|------|-----------|
| [Button](#button) | Atom | ✅ Defined | `src/components/ui/button.tsx` | ✅ |
| [Input](#input) | Atom | ✅ Defined | `src/components/ui/input.tsx` | ✅ |
| [Badge](#badge) | Atom | ⬜ Pending | | |
| [Icon](#icon) | Atom | ⬜ Pending | | |
| [Label](#label) | Atom | ⬜ Pending | | |
| [Checkbox](#checkbox) | Atom | ⬜ Pending | | |
| [Radio](#radio) | Atom | ⬜ Pending | | |
| [Switch](#switch) | Atom | ⬜ Pending | | |
| [Textarea](#textarea) | Atom | ⬜ Pending | | |
| [Select](#select) | Atom | ⬜ Pending | | |
| [Skeleton](#skeleton) | Atom | ⬜ Pending | | |
| [Separator](#separator) | Atom | ⬜ Pending | | |
| [FormField](#form-field) | Molecule | ⬜ Pending | | |
| [SearchBar](#search-bar) | Molecule | ⬜ Pending | | |
| [CardHeader](#card-header) | Molecule | ⬜ Pending | | |
| [EmptyState](#empty-state) | Molecule | ⬜ Pending | | |
| [StatusBadge](#status-badge) | Molecule | ⬜ Pending | | |
| [Toast](#toast) | Molecule | ⬜ Pending | | |
| [Tooltip](#tooltip) | Molecule | ⬜ Pending | | |
| [NavigationBar](#navigation-bar) | Organism | ⬜ Pending | | |
| [Sidebar](#sidebar) | Organism | ⬜ Pending | | |
| [DataTable](#data-table) | Organism | ⬜ Pending | | |
| [Form](#form) | Organism | ⬜ Pending | | |
| [Modal](#modal) | Organism | ⬜ Pending | | |
| [Sheet](#sheet) | Organism | ⬜ Pending | | |
| [CommandPalette](#command-palette) | Organism | ⬜ Pending | | |
| [Card](#card) | Organism | ⬜ Pending | | |

*(Status: ✅ Defined / 🔵 In Progress / ⬜ Pending)*

---

## Component Definitions

---

### Button

> **Level**: Atom
> **Purpose**: Triggers an action or event.

#### Variants

| Variant | Use Case | Style |
|---------|---------|-------|
| `primary` | Main call-to-action; one per view | Filled `--action-primary` |
| `secondary` | Secondary actions | Outlined, no fill |
| `ghost` | Tertiary actions, navigation | No border, subtle hover |
| `destructive` | Irreversible or dangerous actions | `--status-error` color |
| `link` | Navigate to another page/section | Looks like a link |
| `icon-only` | When space is limited, text in tooltip | Icon without label |

#### Props / Parameters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `primary \| secondary \| ghost \| destructive \| link \| icon-only` | `primary` | Visual style |
| `size` | `sm \| md \| lg` | `md` | Button dimensions |
| `disabled` | `boolean` | `false` | Disables interaction |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `type` | `button \| submit \| reset` | `button` | HTML button type |
| `onClick` | `() => void` | — | Click handler |
| `children` | `ReactNode` | — | Button label or icon |

#### States

| State | Appearance | Notes |
|-------|-----------|-------|
| Default | Filled `--action-primary`, `--radius-md` | |
| Hover | `--action-primary-hover` | cursor: pointer |
| Focus | Default + `--shadow-focus` ring | Always visible |
| Active | `--action-primary-active`, slight scale | |
| Selected | N/A for Button | Use nav items instead |
| Disabled | `--action-primary-disabled`, cursor: not-allowed | `aria-disabled` |
| Loading | Spinner replaces/precedes label | Interaction disabled |

#### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| Mobile (< md) | Full width in stacked forms; auto width in inline groups |
| Tablet+ | Auto width |
| Touch | Minimum 44×44px touch target enforced |

#### Accessibility

- Uses native `<button>` element (not `<div>`)
- `aria-disabled="true"` when disabled (keeps focusability)
- `aria-busy="true"` when loading
- `icon-only` variant requires `aria-label`
- Focus ring visible and meets 3:1 contrast ratio

#### Usage Examples

```tsx
// Primary (default)
<Button onClick={handleCreate}>Create Pipeline</Button>

// Destructive
<Button variant="destructive" onClick={handleDelete}>
  Delete Workspace
</Button>

// Loading state
<Button loading={isSubmitting} type="submit">
  Save Changes
</Button>

// Icon only
<Button variant="icon-only" aria-label="Edit item">
  <EditIcon />
</Button>
```

#### Do / Don't

| ✅ Do | ❌ Don't |
|------|---------|
| Use `primary` for the one most important action per view | Put two `primary` buttons side by side |
| Use `destructive` for any action that deletes data | Use `destructive` for routine actions |
| Use `loading` during async operations | Leave user waiting with no feedback |
| Keep button labels concise (2–4 words) | Use full sentences as labels |

---

### Input

> **Level**: Atom
> **Purpose**: Single-line text entry.

#### Variants

| Variant | Use Case |
|---------|---------|
| `default` | Standard text input |
| `password` | Masked password entry |
| `search` | Search/filter inputs |
| `number` | Numeric entry |

#### Props / Parameters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `text \| password \| email \| search \| number \| url` | `text` | Input type |
| `value` | `string` | — | Controlled value |
| `placeholder` | `string` | — | Placeholder (not substitute for label) |
| `disabled` | `boolean` | `false` | Disables input |
| `readOnly` | `boolean` | `false` | Non-editable display |
| `error` | `boolean` | `false` | Shows error styling |
| `id` | `string` | — | Required for `<label>` association |

#### States

| State | Appearance |
|-------|-----------|
| Default | Border `--border-default`, padding `--space-3` |
| Focus | Border `--action-primary`, focus ring |
| Filled | Border `--border-strong` |
| Error | Border `--status-error`, error icon |
| Disabled | Reduced opacity, cursor: not-allowed, bg: `--bg-sunken` |
| Read-only | bg: `--bg-sunken`, no focus ring |

#### Responsive Behavior

| Breakpoint | Behavior |
|-----------|---------|
| All | Full width within its container by default |
| Mobile | 44px min height for touch targets |

#### Accessibility

- Always paired with a `<label>` element via matching `id` and `for` attributes
- Never use `placeholder` as a substitute for a label
- Error state: `aria-invalid="true"` and `aria-describedby` pointing to error text
- Required fields: `required` attribute and visual indicator

#### Usage Example

```tsx
<FormField
  label="Pipeline Name"
  required
  error={errors.name?.message}
>
  <Input
    id="pipeline-name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g., daily-report"
    error={!!errors.name}
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? "name-error" : undefined}
  />
</FormField>
```

---

### Form Field

> **Level**: Molecule
> **Purpose**: Wraps an input with label, optional helper text, and error message.

#### Structure

```
FormField
├── Label (required)
│   └── Required indicator (if required)
├── Helper text (optional)
├── Input / Select / Textarea / etc.
└── Error message (conditional)
```

#### Props / Parameters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Field label text |
| `required` | `boolean` | `false` | Shows required indicator |
| `helperText` | `string` | — | Supporting text below label |
| `error` | `string` | — | Error message (also sets error state on child input) |
| `children` | `ReactNode` | — | The input element |

#### Accessibility

- `<label>` uses `htmlFor` matching the input's `id`
- Error message has `id` referenced by input's `aria-describedby`
- Required indicator (`*`) also conveyed by `aria-required="true"` on the input
- Legend `"* indicates required fields"` at top of any form with required fields

---

*(Continue adding components following the same structure. Use the Component Index above to track status.)*

---

## Composition Patterns

> *Standard combinations of components for recurring UI scenarios.*

### CP-001: Page Header

```
PageHeader (Organism)
├── Breadcrumb (optional)
├── Title (--text-h1)
├── Description (--text-body, --text-secondary)
└── Actions row
    ├── Secondary actions (Button ghost/secondary)
    └── Primary action (Button primary) — rightmost
```

**Rules**:
- One primary action per page header maximum
- Breadcrumb required when page is > 1 level deep
- Description is optional for top-level pages, recommended for sub-pages

---

### CP-002: Empty State

```
EmptyState (Molecule)
├── Illustration or icon (optional)
├── Title (--text-h3)
├── Description (--text-body-sm, --text-secondary)
└── CTA button (Button primary or secondary)
```

**Rules**:
- Always provide a CTA that resolves the empty state
- Title describes what is missing; Description explains why or what to do
- Illustration is optional; icon from the design system icon set is sufficient

---

### CP-003: Confirmation Dialog

```
Modal (Organism)
├── Title — names the action ("Delete workspace")
├── Body — explains irreversibility and consequences
├── Actions row
│   ├── Cancel (Button secondary) — leftmost
│   └── Confirm (Button destructive) — rightmost, names action ("Delete workspace")
```

**Rules**:
- Destructive button label must name the action, not "OK" or "Confirm"
- Cancel is always on the left
- Do not add a checkbox or additional inputs in a confirmation dialog

---

### CP-004: Form Page

```
Form (Organism)
├── PageHeader (CP-001) — title + description
├── Section dividers with labels (optional, for long forms)
├── FormField groups (Molecule × N)
│   └── Input / Select / Textarea atoms
├── Validation summary (conditional, on submit error)
└── Footer actions
    ├── Cancel / Back (Button ghost)
    └── Submit (Button primary)
```

**Rules**:
- Single-column layout on mobile; up to 2-column on desktop for short fields
- Validation runs on blur (field) + on submit (form)
- On submit error: scroll to first invalid field and focus it
- Footer actions are sticky on long forms (mobile)

---

### CP-005: Data Row (List Item)

```
DataRow (Molecule)
├── Leading element (icon, avatar, or status indicator)
├── Primary text (--text-body)
├── Secondary text (--text-body-sm, --text-secondary)
├── Trailing element (badge, timestamp, or action)
└── Selection indicator (checkbox or highlight, when list is selectable)
```

**States**: Default, Hover (`--bg-hover`), Selected (`--bg-selected`), Focused, Disabled

---

## Deprecated Components

| Component | Deprecated Since | Replacement | Removal Target |
|-----------|----------------|-------------|---------------|
| {OldComponent} | {v1.x.x} | {NewComponent} | {v2.x.x} |
