# Interaction Patterns — {Project Name}

> **Document Type**: Interaction Patterns
> **Project**: {Project Name}
> **Rules Reference**: `.cursor/rules/design-system/design-system.mdc` (DS-010)
> **Interaction Design Reference**: `.cursor/rules/ux/interaction-design.mdc` (IXD-007, IXD-008, IXD-016, IXD-017)
> **Created**: {YYYY-MM-DD}
> **Last Updated**: {YYYY-MM-DD}

---

## Purpose

This document defines the standard interaction patterns for {Project Name}. Once a pattern is defined here, it must be applied consistently across all interfaces. These are the "how" decisions that sit between the component library (atoms and molecules) and the page archetype system (layout and structure).

---

## 1. Form Patterns

### 1.1 Form Layout

- **Single column** by default on all breakpoints for focused forms (Guided Flow archetype)
- **Two columns** permitted on desktop (≥ md) for short adjacent fields (e.g., First name + Last name, City + Zip)
- **Field width** communicates expected input length: full-width for names, URLs, descriptions; half-width for zip codes, dates, quantities
- **Section grouping**: long forms are divided into labeled sections with a `--border-subtle` separator and a section heading at `--text-h3`
- **Required field legend**: always display "* indicates required fields" at the top of any form that has required fields

### 1.2 Validation Strategy

| Trigger | Behavior |
|---------|---------|
| On blur (leaving a field) | Validate that specific field only; show error if invalid |
| On change | Only for fields that were previously in error state (re-validate on fix) |
| On submit | Validate all fields; prevent submission if any are invalid |
| On keystroke | Never — do not validate while user is typing |

**Error messages must be specific**:
- "Email is required" — not "Field is required"
- "Password must be at least 8 characters" — not "Invalid password"
- "This email is already registered. Sign in instead?" — not "Email already exists"

### 1.3 Submission Flow

1. User clicks submit button
2. Button enters `loading` state (spinner + disabled); form inputs become `disabled`
3. If validation fails: button returns to default; form inputs re-enable; scroll to first invalid field and focus it; show error on each invalid field
4. If submission succeeds: show success feedback (toast or inline); redirect if appropriate; or reset form
5. If submission fails (server error): button returns to default; show error toast or inline banner; inputs re-enable for retry

### 1.4 Destructive Form Actions

Any action that permanently deletes, removes, or irreversibly modifies data requires a confirmation dialog before execution.

**Confirmation dialog rules**:
- Title names the action: "Delete {entity name}" — not "Are you sure?"
- Body describes the consequence: "This will permanently delete all content and cannot be undone."
- Cancel button: labeled "Cancel", positioned left
- Confirm button: `variant="destructive"`, labeled with the action ("Delete workspace") — not "OK" or "Confirm"
- Do not include additional inputs or checkboxes in the confirmation dialog

---

## 2. Navigation Patterns

### 2.1 Primary Navigation

- Max 7 items in the primary navigation
- Current item: highlighted with pillar accent left border + `--text-primary` weight 500
- Inactive items: `--text-secondary` weight 400
- Icons: optional but consistent (all items have icons or none do)
- Mobile: collapses to Sheet (slide from left); hamburger trigger in top bar

### 2.2 Contextual Navigation (Sidebar)

- Sidebar items use `--pillar-accent` for active state background (`--bg-selected`) and text
- Nested items indent by `--space-6` (24px)
- Collapsed sections: show item count badge
- Empty sections: hidden (do not show empty sidebar sections)

### 2.3 Breadcrumbs

- Required when page is > 1 level deep
- Current page name: `--text-primary` weight 500, not a link
- Parent pages: `--text-secondary`, links
- Separator: `/` or `›` using `--text-tertiary`
- Max visible crumbs: 4; truncate middle segments with `...`

### 2.4 Tab Navigation

- Tabs communicate equal-weight sibling sections
- Do not use tabs for sequential steps (use Guided Flow archetype instead)
- Active tab: `--pillar-accent` bottom border (2px), `--text-primary`
- Inactive tab: `--text-secondary`, hover adds `--bg-hover`
- Mobile: collapse to Select dropdown if > 4 tabs

### 2.5 Back Navigation

- "Back" links use `←` chevron + destination name: "← {section name}"
- Browser back button is always functional (no single-page-app states that break back)
- On Guided Flows, "Back" returns to the previous step within the flow, not the browser history

---

## 3. Loading Patterns

### 3.1 Skeleton Loading

Use skeleton loading for any content area with a predictable layout:
- Cards, list items, tables, dashboard widgets, article content
- Skeleton must mirror the expected content shape (same height, same column structure)
- Skeleton uses `--bg-hover` or `--color-neutral-150` with a shimmer animation
- Show skeleton for loading states > 200ms; show nothing for < 200ms (no flash)

```
Skeleton example for a list row:
┌────────────────────────────────────────────────────┐
│  [████]  [████████████████]   [████]  [████████]   │
└────────────────────────────────────────────────────┘
```

### 3.2 Button Loading

- `loading` prop on Button: replaces or prepends label with spinner; disables interaction
- Button width is preserved during loading state (no layout shift)
- Do not change the button text during loading (e.g., do not change "Save" to "Saving...")

### 3.3 Full-Page Loading

- Avoid full-page loading screens whenever possible
- When unavoidable (initial app load, critical auth check): show app chrome skeleton, not a blank screen or a full-screen spinner
- Never block the full viewport with an opaque overlay + spinner for in-page operations

### 3.4 Progressive Loading

- Above-the-fold content loads first and is visible immediately
- Below-the-fold content loads lazily
- Data that takes > 2 seconds should load with a skeleton placeholder

### 3.5 Optimistic Updates

Preferred for low-stakes actions (toggle, like, quick edit):
- Apply the state change immediately in the UI
- Send the request in the background
- On success: no visible change (state is already updated)
- On failure: revert the optimistic change + show error toast

---

## 4. Error Patterns

### 4.1 Form Field Errors

- Displayed directly below the field that caused the error
- Uses `--status-error` color for border + icon + text
- Error text at `--text-body-sm`
- Announced via `aria-describedby` and `aria-invalid`
- On submit: all field errors shown simultaneously; scroll to first error

### 4.2 Toast Errors

Use toasts for errors that are:
- System-generated (not caused by a specific form field)
- Asynchronous (background operation that failed)
- Non-blocking (user can continue working)

Toast error: `--status-error` left border, error icon, message, optional retry action. Duration: persistent until dismissed (no auto-dismiss for errors).

### 4.3 Inline Banner Errors

Use an inline banner (below the page header, above the content) for:
- Page-level errors that affect the entire view
- Partial data failures ("Some results could not be loaded")
- Recoverable states that persist

Banner: `--status-error-bg` background, error icon, message, action button (Retry / Refresh).

### 4.4 Full-Page Errors

For fatal errors (page not found, permission denied, server error):
- Show a full-page error with a clear title, explanation, and recovery action
- 404: "Page not found" + link to home
- 403: "You don't have permission to view this" + contact support link
- 500: "Something went wrong on our end" + retry button

---

## 5. Confirmation Patterns

| Action Type | Confirmation Required? | Method |
|-------------|----------------------|--------|
| Delete (irreversible) | Yes | Confirmation dialog (destructive button) |
| Remove from collection | Yes | Confirmation dialog |
| Bulk delete (> 1 item) | Yes | Confirmation dialog with count |
| Archive (reversible) | Optional | Toast with undo action (5s) |
| Publish / make public | Optional for minor content; Yes for major changes | Depends on consequences |
| Discard unsaved changes | Yes | Dialog on navigation away |
| Disable a feature | No | Toggle + inline status change |
| Log out | No | Immediate |

---

## 6. Empty States

Every list, table, or data view that can be empty must have an empty state. Empty states must include an action that resolves the emptiness.

| Context | Title | Description | Action |
|---------|-------|-------------|--------|
| No items exist yet | "No {items} yet" | "Create your first {item} to get started." | Button: "Create {item}" |
| Search returned no results | "No results for "{query}"" | "Try a different search term or clear the filters." | Button: "Clear filters" |
| Filtered view is empty | "No {items} match your filters" | "Try adjusting or clearing your filters." | Button: "Clear filters" |
| No permission to see items | "Nothing to see here" | "You don't have access to any {items} yet." | Link to request access |
| Error prevented load | "Couldn't load {items}" | "There was an error loading your {items}." | Button: "Try again" |
| {Additional context} | {Title} | {Description} | {Action} |

**Empty state design rules**:
- An icon (from the design system icon set) is recommended but not required
- Illustrations are permitted only in onboarding-critical empty states
- Never use empty states as a marketing opportunity in functional UI

---

## 7. Feedback Patterns

### 7.1 Success Feedback

| Action Type | Feedback Method | Duration |
|-------------|----------------|---------|
| Form save | Toast: "Changes saved" | 3 seconds, auto-dismiss |
| Create item | Toast: "{Item} created" + optional link | 4 seconds, auto-dismiss |
| Delete item | Toast: "{Item} deleted" + Undo | 5 seconds, auto-dismiss |
| Publish | Inline banner or toast: "Published" | Toast: 4s; banner: manual dismiss |
| Long async operation | Toast when complete: "{Operation} complete" | 4 seconds |

### 7.2 Interim Feedback

- For operations that take 2–30 seconds: show progress indicator in the triggering button or a progress bar at the top of the page
- For operations > 30 seconds: show a step-based progress indicator ("Step 2 of 4: Processing...")
- For background operations: show a notification in the notification center when complete

---

## 8. Keyboard Interaction

### 8.1 Global Shortcuts

> *Define project-specific global keyboard shortcuts here.*

| Shortcut | Action |
|---------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `?` | Show keyboard shortcut help |
| `Escape` | Close modal / dismiss dropdown |
| `{shortcut}` | {Action} |

### 8.2 Component-Specific Keyboard Behavior

| Component | Key | Action |
|-----------|-----|--------|
| Dropdown / Select | `↑` `↓` | Navigate options |
| Dropdown / Select | `Enter` | Select focused option |
| Dropdown / Select | `Escape` | Close without selecting |
| Modal | `Escape` | Close (if not blocking) |
| Table row | `Space` | Toggle row selection |
| Tabs | `←` `→` | Move between tabs |
| Data table | `Shift + click` | Range select rows |
| Command palette | `↑` `↓` | Navigate results |
| Command palette | `Enter` | Execute selected action |

### 8.3 Focus Management

- When a modal opens: move focus to the first interactive element inside
- When a modal closes: return focus to the element that triggered it
- When a toast appears: do not steal focus
- When a form error is shown on submit: move focus to the first error field

---

## 9. Dark / Light Mode Switching

### 9.1 Mode Persistence

- User preference stored in `localStorage` under key `color-scheme`
- Default: follow system `prefers-color-scheme` (light or dark)
- Persist choice across sessions

### 9.2 Mode Switch Behavior

- Switching is immediate — no page reload
- Apply 200ms CSS transition on `background-color` and `color` on `body` or `:root`
- Toggle control is in the user settings or persistent in the top navigation

```css
/* Enable smooth mode transitions */
:root {
  transition: background-color 200ms var(--ease-default),
              color 200ms var(--ease-default);
}
```

### 9.3 Dark Mode Token Overrides

Dark mode reverses surface and text values. Define dark overrides in a `.dark` class applied to `<html>` or `<body>`:

```css
:root {
  /* Light mode (default) */
  --bg-page: var(--color-neutral-50);
  --bg-surface: var(--color-neutral-0);
  --text-primary: var(--color-neutral-900);
  /* ... */
}

.dark {
  /* Dark mode overrides */
  --bg-page: var(--color-neutral-950);
  --bg-surface: var(--color-neutral-900);
  --text-primary: var(--color-neutral-50);
  /* ... */
}
```

### 9.4 Verification Requirement

Every component must be verified in both light and dark mode before merge. WCAG AA contrast must be checked independently in each mode.
