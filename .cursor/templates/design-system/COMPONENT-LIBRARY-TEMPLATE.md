# Component Library — {Project Name}

> **Document Type**: Component Library  
> **Project**: {Project Name}  
> **Design System Reference**: `docs/design-system/DESIGN-SYSTEM.md`  
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-006 through DS-009)  
> **Created**: {YYYY-MM-DD}  
> **Last Updated**: {YYYY-MM-DD}

---

## Component Index

| Component | Level | Status | File |
|-----------|-------|--------|------|
| [Button](#button) | Atom | ✅ Defined | `src/components/ui/button.tsx` |
| [Input](#input) | Atom | ✅ Defined | `src/components/ui/input.tsx` |
| [Select](#select) | Atom | 🔵 In Progress | |
| [FormField](#form-field) | Molecule | ⬜ Pending | |

*(Expand this table as components are defined. Status: ✅ Defined / 🔵 In Progress / ⬜ Pending)*

---

## Component Definitions

---

### Button

> **Level**: Atom  
> **Purpose**: Triggers an action or event.

#### Variants

| Variant | Use Case | Style |
|---------|---------|-------|
| `primary` | Main call-to-action; one per view | Filled brand color |
| `secondary` | Secondary actions | Outlined, no fill |
| `ghost` | Tertiary actions, navigation | No border, subtle hover |
| `destructive` | Irreversible or dangerous actions | Red/error color |
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
| Default | {Filled brand color, rounded} | |
| Hover | {Darker shade, cursor: pointer} | |
| Focus | {Default + focus ring via `--shadow-focus`} | Always visible |
| Active | {Even darker, slight scale down} | |
| Disabled | {Reduced opacity, cursor: not-allowed, aria-disabled} | |
| Loading | {Spinner replaces/precedes label, interaction disabled} | |

#### Accessibility

- Uses native `<button>` element (not `<div>`)
- `aria-disabled="true"` when disabled (not `disabled` attribute alone, to keep focusability)
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
| Default | {Border `--border-default`, padding `--space-3`} |
| Focus | {Border `--color-action-primary`, focus ring} |
| Filled | {Border darkens slightly} |
| Error | {Border `--color-error-500`, error icon} |
| Disabled | {Reduced opacity, cursor: not-allowed, bg: `--color-neutral-50`} |
| Read-only | {bg: `--color-neutral-50`, no focus ring} |

#### Accessibility

- Always paired with a `<label>` element via matching `id` and `for` attributes
- Never use `placeholder` as a substitute for a label
- Error state communicated via `aria-invalid="true"` and `aria-describedby` pointing to error text
- Required fields marked with `required` attribute and visual indicator

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
| `error` | `string` | — | Error message (also sets error state on input) |
| `children` | `ReactNode` | — | The input element |

#### Accessibility

- `<label>` uses `htmlFor` matching the input's `id`
- Error message has `id` referenced by input's `aria-describedby`
- Required indicator (visual `*`) also conveyed by `aria-required="true"` on input
- Legend `"* indicates required fields"` at top of any form with required fields

---

*(Continue adding components following the same structure)*

---

## Deprecated Components

| Component | Deprecated Since | Replacement | Removal Date |
|-----------|----------------|-------------|-------------|
| {OldButton} | {v1.2.0} | {Button} | {v2.0.0} |
