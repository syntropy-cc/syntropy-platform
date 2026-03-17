# Interaction Patterns — Syntropy Ecosystem

> **Document Type**: Interaction Patterns
> **Project**: Syntropy Ecosystem
> **Component Library Reference**: `docs/design-system/COMPONENT-LIBRARY.md`
> **Page Archetypes Reference**: `docs/design-system/PAGE-ARCHETYPES.md`
> **Created**: 2026-03-16
> **Last Updated**: 2026-03-16

---

## Purpose

This document defines how recurring interactions behave across the ecosystem. Components tell you *what* to render; this document tells you *when* and *how* those components behave together. These are the rules that ensure a form in Learn behaves the same way as a form in Hub.

---

## 1. Form Patterns

### 1.1 Form Layout

- Labels always above inputs (never to the side).
- One field per row as default. Two short fields per row (e.g., first/last name) permitted at ≥768px.
- Mobile: always single column.
- Required fields marked with asterisk (*) in `--color-error-500` after the label text.
- Helper text below label, above input, in `--text-caption` + `--text-secondary`.
- Group related fields with a section heading (`--text-h3`) and `--space-8` gap between groups.

### 1.2 Validation Strategy

**When to validate**:
- Required fields: on blur (when the user leaves the field) + on submit.
- Format validation (email, URL): on blur + on submit.
- Complex validation (uniqueness, availability): on submit only (with loading state on the submit button).
- Never validate on every keystroke — it creates a hostile experience for the user who is still typing.

**How to show errors**:
- Error message appears below the input in `--text-caption` + `--color-error-500` with a warning icon (Lucide `AlertCircle`, 14px).
- Input border changes to `--border-error`.
- Focus ring changes to `--focus-ring-error`.
- On submit with errors: scroll to the first invalid field. Focus that field.
- Error messages are specific: "Email is required" not "This field is required." "Must be a valid email address" not "Invalid format."

### 1.3 Submission Flow

1. User clicks submit button.
2. Button enters loading state immediately (spinner, `aria-busy`, interaction disabled).
3. Client-side validation runs. If errors: button exits loading, scroll to first error, focus it.
4. If valid: API call fires. Button remains in loading state.
5. On success: Toast notification (success variant) + redirect or content update. Button returns to default.
6. On error: Toast notification (error variant) with actionable message. Button returns to default. Form retains user input.
7. Network error: Toast with "Connection failed. Please try again." + retry guidance.

### 1.4 Destructive Form Actions

Forms that perform irreversible actions (delete institution, reject contribution, dissolve institution) require a confirmation Dialog before execution.

**Confirmation Dialog structure**:
- Title: what is about to happen ("Delete institution?")
- Description: consequences ("This will permanently delete all projects and artifacts. This cannot be undone.")
- Cancel button (secondary): left.
- Confirm button (destructive): right. Label matches the action ("Delete institution").
- Optional: require the user to type the entity name to confirm.

---

## 2. Navigation Patterns

### 2.1 Primary Navigation (Navbar)

- Always visible at the top of every page.
- Pillar links: Learn, Hub, Labs. Active pillar highlighted.
- Clicking a pillar link navigates to that pillar's landing page.
- User menu (right): avatar + dropdown with Profile, Settings, Sign Out.
- Logo click returns to the ecosystem landing page (not the current pillar's landing).

### 2.2 Contextual Navigation (Sidebar)

- Present in Dense List and Entity Detail archetypes.
- Shows items relevant to the current context (institution's projects, lab's research lines, track's courses).
- Active item: `--bg-selected` + `--text-primary`.
- Collapsible. State persists in localStorage.

### 2.3 Breadcrumbs

- Used when the user is more than 2 levels deep in a hierarchy.
- Learn: Career > Track > Course > Fragment.
- Hub: Institution > Project > Issue.
- Labs: Laboratory > Research Line > Article.
- Current page is not a link. Parent pages are links.
- On mobile: show only the parent (e.g., "← Back to Project") instead of full breadcrumb trail.

### 2.4 Tab Navigation

- Used in Entity Detail archetype for switching between views of the same entity.
- Tabs do not navigate to a new URL — they switch the visible content.
- Active tab state persists in URL query parameter (e.g., `?tab=governance`) so it is shareable and survives refresh.
- Keyboard: Arrow keys move between tabs. Enter/Space activates.

### 2.5 Back Navigation

- The browser's back button must always work correctly.
- Wizards (Guided Flow) update URL per step so back button goes to previous step, not exits the wizard.
- Sheet and Dialog dismissal does not add a history entry.

---

## 3. Loading Patterns

### 3.1 Skeleton Loading

- **When**: Content is being fetched from the server. The layout is known but the data is not.
- **How**: Render Skeleton components matching the shape of the expected content. Shimmer animation.
- **Where**: List rows, cards, stat cards, article content, user profile.
- **Duration threshold**: If loading takes > 200ms, show skeleton. If < 200ms, show nothing (avoid flash).

### 3.2 Button Loading

- **When**: An action is in progress (form submission, publish, delete).
- **How**: Spinner icon replaces or precedes the button label. Button is disabled. `aria-busy="true"`.
- **Duration**: No minimum — show loading immediately on click.

### 3.3 Full-Page Loading

- **When**: The entire page is loading (first render, route transition).
- **How**: Navbar remains visible (already loaded). Content area shows Skeleton for the page archetype. No full-screen spinner.
- **Never**: A blank white/dark screen with only a spinner. The user must always see the structural layout.

### 3.4 Progressive Loading

- **When**: A page has multiple independent data sources (dashboard with stat cards + activity feed + chart).
- **How**: Each section loads independently. Show Skeleton per section. Sections render as their data arrives. Do not wait for all data before rendering anything.

### 3.5 Optimistic Updates

- **When**: An action has high success probability (toggle, like, mark as read).
- **How**: Update the UI immediately. If the server rejects, revert and show error Toast.
- **When not to use**: Irreversible actions (delete, publish, submit). Always wait for server confirmation.

---

## 4. Error Patterns

### 4.1 Form Errors

See Section 1.2 (Validation Strategy).

### 4.2 Toast Errors

- **When**: An action failed but the user can retry or the error is transient.
- **Content**: Specific message + guidance. "Failed to publish artifact. Check your connection and try again." Not: "Something went wrong."
- **Duration**: Error toasts remain until dismissed (no auto-dismiss for errors).
- **Position**: Bottom-right (desktop), bottom-center (mobile).

### 4.3 Inline Errors

- **When**: A specific component or section failed to load.
- **How**: Replace the component's content with an error message + retry button. Do not break the rest of the page.
- **Example**: A stat card that failed to load shows: icon + "Failed to load" + "Retry" link.

### 4.4 Full-Page Errors

- **When**: The entire page cannot render (404, 500, permission denied).
- **How**: EmptyState pattern. Illustration (geometric flat), clear title, description, and a primary action ("Go back" or "Return to home").
- **404**: "Page not found. The page you're looking for doesn't exist or has been moved."
- **500**: "Something went wrong. We're working on it. Please try again in a few minutes."
- **403**: "Access denied. You don't have permission to view this page." + link to request access if applicable.

---

## 5. Confirmation Patterns

### 5.1 When to Confirm

| Action Type | Confirmation Required? | Method |
|-------------|----------------------|--------|
| Delete anything | Yes | Dialog with destructive button |
| Publish (irreversible version) | Yes | Dialog: "This version will be permanently public" |
| Reject contribution | Yes | Dialog with optional feedback field |
| Submit governance proposal | Yes | Dialog showing proposal summary |
| Leave an unsaved form/editor | Yes | Browser-native "unsaved changes" prompt |
| Toggle a setting | No | Optimistic update |
| Add an item to a list | No | Optimistic update |
| Navigate away from current view | No (unless unsaved changes) | — |

### 5.2 Confirmation Dialog Structure

See Section 1.4 (Destructive Form Actions) for the Dialog structure.

**Rule**: The confirm button's label always matches the action verb. "Delete," not "OK." "Publish," not "Confirm." "Reject contribution," not "Yes."

---

## 6. Empty States

### 6.1 When to Show

Every list, grid, table, and collection must have an empty state. There are no blank voids in the UI.

### 6.2 Empty State Content

| Context | Title | Description | Action |
|---------|-------|-------------|--------|
| No projects in institution | "No projects yet" | "Create your first project to start collaborating." | "Create project" (primary button) |
| No fragments in course | "This course is empty" | "The track creator hasn't added fragments yet." | None (or "Notify creator" if applicable) |
| No search results | "No results found" | "Try different keywords or browse categories." | None |
| No reviews on article | "No reviews yet" | "Be the first to review this article." | "Write a review" (primary button) |
| No items after filter | "No matches" | "No items match your current filters." | "Clear filters" (ghost button) |

---

## 7. Feedback Patterns

### 7.1 Success Feedback

| Action | Feedback Type |
|--------|---------------|
| Form submitted | Toast (success) + redirect |
| Artifact published | Toast (success) + animation (spring ease) + portfolio update |
| Achievement unlocked | Toast (success, amber icon) + XP display |
| Contribution accepted | Toast (success) + status update in list |
| Settings saved | Toast (success) + "Saved" text near save button |

### 7.2 Interim Feedback

| Action | Feedback Type |
|--------|---------------|
| File uploading | Progress bar + percentage + file name |
| Long computation | Button loading + explanatory text below ("Generating preview...") |
| Multi-step process | Progress indicator showing current step |

---

## 8. Keyboard Interaction

### 8.1 Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search bar |
| `Escape` | Close modal/dialog/sheet, deselect, exit focus |
| `Tab` | Move focus forward through focusable elements |
| `Shift+Tab` | Move focus backward |

### 8.2 Component-Specific

| Component | Keys |
|-----------|------|
| Tabs | Arrow Left/Right to move between tabs, Enter/Space to activate |
| Dropdown Menu | Arrow Up/Down to navigate items, Enter to select, Escape to close |
| Dialog | Tab cycles within dialog (focus trap), Escape to close |
| List (Dense List) | Arrow Up/Down to navigate rows, Enter to open selected row |

---

## 9. Dark/Light Mode Switching

- User preference stored in localStorage. Default: system preference (`prefers-color-scheme`).
- Toggle accessible from user menu (Settings) and optionally from Navbar.
- Switching mode applies immediately without page reload.
- All components use semantic tokens that resolve differently per mode. No component checks for dark/light mode explicitly — the tokens handle it.
- Transition: 200ms on `background-color` and `color` to avoid jarring flash.
