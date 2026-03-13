# Interaction Design — Syntropy Ecosystem

> **Document Type**: Interaction Design  
> **Project**: Syntropy Ecosystem  
> **Interface Types**: Web Application, Dashboard/Admin, REST API, Embedded IDE  
> **Created**: 2026-03-12  
> **Last Updated**: 2026-03-12  
> **Interaction Designer**: AGT-IXD  
> **UX Principles Reference**: `docs/ux/UX-PRINCIPLES.md`  
> **Architecture Reference**: `docs/architecture/ARCHITECTURE.md`

---

## 1. Information Architecture

### 1.1 Top-Level Navigation (Web)

Primary navigation has at most 7 items (IXD-006):

| Item | Purpose | Contains |
|------|---------|----------|
| Learn | Tracks, courses, fragments, progress, mentors | Track discovery, active track, fragment view, gallery |
| Hub | Institutions, projects, issues, contributions, public square | Institution/project discovery, project page, issue view, contribution flow |
| Labs | Laboratories, research lines, articles, reviews | Lab/research line list, article editor, review flow, discovery |
| Platform | Portfolio, search, planning, notifications, profile | Portfolio view, cross-pillar search, planning board, notifications, profile/settings |

Admin is a protected cluster (e.g. "Admin" link or route) visible only to Administrators/Moderators; it uses the same design system and shares nav context (e.g. breadcrumb: Admin > Moderation).

### 1.2 Pillar Switching and Context

- Switching between Learn, Hub, and Labs does not discard in-progress context: e.g. draft fragment progress or unsaved article state is preserved where the architecture allows.
- Breadcrumbs: `[Pillar] > [Section] > [Resource]` (e.g. Learn > Track name > Fragment 3).
- Back behavior: Browser back or in-app back returns to the previous view; destructive or irreversible steps (e.g. "Publish version") are confirmed before commit.

### 1.3 Admin / Dashboard Scope

First-class entry points (same design system, aligned patterns):

- **Moderation** — Content queue, approve/reject, feedback to submitter.
- **Role management** — Assign/revoke roles; audit trail.
- **Schema registry** (if exposed) — View/update artifact type schemas.
- **Health** — Ecosystem health, event bus/processing status (read-only or with alerts).

Flows are task-focused; key screens and transitions are defined; full step-by-step flows can be expanded in a later iteration.

---

## 2. Interaction Flows

### Flow 1: New User Onboarding to First Contribution (Workflow 2)

> **Type**: Tutorial / Setup  
> **User**: New user (no prior experience)  
> **Entry Point**: Institutional site "Get Started" or sign-up  
> **Success Exit**: First artifact published; portfolio updated; recommendations (forum/mentor) shown  
> **Frequency**: Once per user; high concurrency during growth

#### Happy Path

| Step | User Action | System Response | Interface Element |
|------|-------------|-----------------|-------------------|
| 1 | Clicks "Get Started" | Sign-up / login (email or OAuth) | Sign-up form or OAuth buttons |
| 2 | Completes auth | Redirect to onboarding; single account for all pillars | Redirect |
| 3 | Answers career discovery (interests, background, goals) | Recommendation of career track with short explanation | Wizard steps, CTA "Start this track" |
| 4 | (Optional) Takes placement quiz | Suggestion of courses/tracks to skip | Quiz UI, results summary |
| 5 | Enters first Learn track; opens first fragment | Fragment view (Problem → Theory → Artifact) | Fragment layout, "Open in IDE" / "Build artifact" |
| 6 | Builds artifact in embedded IDE; publishes | "Publishing…" then "Published"; event bus records; portfolio + XP + first achievement | IDE toolbar "Publish"; toast "Artifact published" |
| 7 | Sees success and next steps | Portfolio updated; recommendation engine suggests forum thread or mentor | Success view; recommendation cards (2–3 items) |

#### Error Paths

| Error Condition | System Response | Recovery Action |
|-----------------|-----------------|-----------------|
| Auth failure (invalid credentials, OAuth error) | Inline or toast: "We couldn't sign you in. Check your details or try again." | Retry; "Forgot password" / try different provider |
| Validation error on sign-up (e.g. email format) | Inline under field: specific message | Correct field, resubmit |
| Career discovery skipped / no recommendation | Default: show track list; "Browse all tracks" | User picks a track manually |
| Artifact publish fails (e.g. network, validation) | Toast: "Publish failed. [Reason]." + "Try again" | Retry; if persistent, link to help or save draft |
| Session timeout during onboarding | Modal or banner: "Session expired. Please sign in again." | Re-authenticate; resume from last saved step if available |

#### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User closes tab midway | On next login, resume from last completed step (e.g. track selected); career discovery state optional to re-run |
| Slow connection during publish | Show "Publishing…" (spinner or status text); no timeout message until backend timeout; then "Publish failed. Try again." |
| User already has account (arrived via direct link) | Skip "Get Started" to login; after login, redirect to target or default (e.g. Learn home) |

---

### Flow 2: Cross-Pillar Learning to Contribution (Workflow 1)

> **Type**: Task  
> **User**: Learner who is also (or becoming) a Hub contributor  
> **Entry Point**: After completing a Learn fragment and publishing artifact  
> **Success Exit**: Contribution submitted; when accepted, portfolio and XP updated  
> **Frequency**: Multiple times per week per active learner

#### Happy Path

| Step | User Action | System Response | Interface Element |
|------|-------------|-----------------|-------------------|
| 1 | Completes fragment; builds and publishes artifact | Event bus captures completion; recommendation engine runs | Fragment "Publish" → toast "Published" |
| 2 | Sees suggestion: "Your artifact could resolve these issues" (2–3 Hub issues) | Non-intrusive card/section with issue titles and project | Recommendation block (inline or below fragment) |
| 3 | Clicks one suggested issue | Navigates to Hub issue in context (same tab or new) | Link to Hub issue |
| 4 | Reads issue (description, acceptance criteria, artifact type) | Issue page with "Contribute" CTA | Issue detail view |
| 5 | Opens embedded IDE in issue context | IDE loads with issue context; can reference project artifacts | "Open in IDE" button; IDE panel |
| 6 | Builds/adapts artifact; submits as contribution | "Submitting…" then "Contribution submitted"; event bus captures | "Submit contribution" button; toast |
| 7 | Maintainer reviews; accepts | User receives notification; portfolio updated; XP awarded | Notification (toast or in-app); portfolio reflects acceptance |

#### Error Paths

| Error Condition | System Response | Recovery Action |
|-----------------|-----------------|-----------------|
| No matching issues found | Message: "No open issues match this artifact yet. You could start your own project or explore Hub." | CTA: "Explore Hub" / "Create project" |
| Contribution rejected (with feedback) | Notification: "Your contribution wasn’t accepted." + structured feedback (inline or link) | User can read feedback, update artifact, resubmit |
| Contribution rejected (no feedback) | Notification: "Your contribution wasn’t accepted. The maintainer may add feedback later." | User can resubmit or choose another issue |
| Submit fails (validation, e.g. wrong artifact type) | Inline or toast: "Contribution couldn’t be submitted: [actionable reason]." | Correct and resubmit |
| Submit fails (network / 5xx) | Toast: "Something went wrong. Please try again." Optional: "Retry" | Retry; draft preserved if possible |

#### Edge Cases

| Edge Case | Handling |
|-----------|----------|
| User navigates away before submit | Draft preserved in session/local where supported; on return, "Continue your contribution" or re-open IDE |
| Concurrent edit (maintainer closes issue) | On submit: "This issue was closed." Offer: "View other open issues" |
| Slow recommendation load | Skeleton or "Loading suggestions…"; do not block fragment completion view; show recommendations when ready (<5s target) |

---

### Flow 3: High-Volume Error Path — Contribution Rejected / Validation Error on Submit

> **Type**: Recovery  
> **User**: Contributor (any role submitting to Hub)  
> **Entry Point**: User has submitted or is about to submit a contribution  
> **Success Exit**: User understands why it failed and can correct and resubmit or move on  
> **Frequency**: High volume (many contributions per day ecosystem-wide)

#### Scenario A: Contribution Rejected by Maintainer

| Step | User Action | System Response | Interface Element |
|------|-------------|-----------------|-------------------|
| 1 | Maintainer rejects with structured feedback | Event; notification sent to contributor | (Maintainer UI: reject + optional feedback form) |
| 2 | Contributor sees notification | In-app notification and/or email: "Your contribution to [project/issue] wasn’t accepted." | Notification list; email |
| 3 | Clicks through to feedback | Feedback view: maintainer’s comments, artifact link, issue link | Dedicated feedback page or modal |
| 4 | User updates artifact or responds | Can resubmit (new contribution) or comment | "Resubmit" button; comment thread |
| 5 | Resubmits | Same as Flow 2 submit; "Contribution submitted" | Toast; notification to maintainer |

**Recovery actions**: Always show "View feedback" and "Resubmit" or "Try another issue." No dead end.

#### Scenario B: Validation Error on Submit (e.g. Wrong Artifact Type, Required Field Missing)

| Step | User Action | System Response | Recovery Action |
|------|-------------|-----------------|-----------------|
| 1 | Clicks "Submit contribution" | Client or server validation fails | Inline errors under relevant fields or toast with list |
| 2 | Sees error message | "Contribution couldn’t be submitted: [specific reason]." (e.g. "This issue expects artifact type X; yours is Y.") | User corrects artifact or selects different issue |
| 3 | Corrects and resubmits | Submit succeeds; toast "Contribution submitted" | — |

**Placement**: Inline for form-like fields; toast for single global validation message. No technical codes (e.g. VALIDATION_ERROR) in copy; use actionable language.

---

### Flow 4: Learner Develops Track to Complete Project (Workflow 3) — Key Screens and Transitions

| Step | Screen / Transition | Notes |
|------|----------------------|-------|
| 1 | Active track home: navigation map (completed / current / upcoming courses) | Progress visible; "Continue" on current fragment |
| 2 | Fragment view: Problem → Theory → Artifact; "Open in IDE" | State: loading (skeleton), empty (no attempt), in progress, published |
| 3 | IDE: build artifact; "Publish" | Toast on publish; return to fragment with "Published" state |
| 4 | After fragment: optional forum link; next fragment or course summary | Recommendations (e.g. Hub issues) if applicable |
| 5 | Course complete: collectible assembled; Track complete: project complete, portfolio updated | Success view; CTA to next track or Hub |

Error paths: fragment load failure → error state + "Retry"; publish failure → toast + retry. Empty state: "You haven’t started this fragment yet."

---

### Flow 5: Contributor Discovers and Contributes to Project (Workflow 6) — Key Screens and Transitions

| Step | Screen / Transition | Notes |
|------|----------------------|-------|
| 1 | Public square or Learn suggestion: filter by domain, contribution type | List/grid of projects or issues |
| 2 | Project page: description, artifacts, roadmap, open issues, governance link | "Contribute" or issue list |
| 3 | Issue detail: description, acceptance criteria, expected artifact type | "Open in IDE" / "Submit contribution" |
| 4 | IDE in issue context; build; submit | Same as Flow 2 steps 5–6 |
| 5 | Maintainer review: accept/reject with feedback | Contributor notified (Flow 3) |
| 6 | Accepted: portfolio updated; value distribution updated if applicable | Notification; portfolio reflects contribution |

---

### Flow 6: Creating Digital Institution and First Project (Workflow 5) — Key Screens and Transitions

| Step | Screen / Transition | Notes |
|------|----------------------|-------|
| 1 | "Create institution" entry; template selection (Personal, Technical Cooperative, Research Lab, Collaborative Product, Advanced) | Wizard step 1 |
| 2 | Template summary in plain language; accept or modify parameters | Step 2; optional "Advanced" |
| 3 | Confirm; governance contract generated and signed | Irreversibility note; "Create institution" |
| 4 | Create first project: artifact manifesto, monetization, visibility | Form; validation inline |
| 5 | Create first issue: description, expected artifact type, acceptance criteria | Form |
| 6 | Success: institution and project live; if public, in public square | Success view; link to project |

---

### Flow 7: Complete Scientific Publication Cycle (Workflow 7) — Key Screens and Transitions

| Step | Screen / Transition | Notes |
|------|----------------------|-------|
| 1 | Create laboratory (if needed): smart contract config (co-authorship, visibility, review permissions) | Wizard or form |
| 2 | Create research line: hypothesis, methodology, subject area | Form |
| 3 | Add collaborators; add artifacts (datasets, experiments, code) to line | List + add flows |
| 4 | Article editor (MyST/LaTeX); real-time render; embed artifacts | Editor + preview |
| 5 | Publish (irreversible): DOI generated; article public | Confirmation modal; then "Publishing…" / "Published" |
| 6 | Reviewers submit reviews; researcher filters by reputation; responds; publishes v2 | Review list; response UI; version link |
| 7 | Research line marked concluded | Status update |

---

### Flow 8: Embedded IDE Entry and Exit

> **User**: Any role editing code, article, or experiment  
> **Context**: Learn (fragment), Hub (issue), Labs (article/experiment)

| Step | User Action | System Response | Interface Element |
|------|-------------|-----------------|-------------------|
| 1 | Clicks "Open in IDE" / "Edit here" from fragment, issue, or article | IDE loads in context (same page or panel); focus moves to editor | Button/link in fragment, issue, or article view |
| 2 | Edits; may run/build | Editor state; run output; unsaved indicator if applicable | IDE chrome (tabs, run, publish) |
| 3 | Clicks "Publish" / "Submit" / "Save" or closes IDE | Publish/submit flow; or "You have unsaved changes" if closing with dirty state | Confirm or save; then close |
| 4 | Returns to context (fragment/issue/article) | Context view shows updated state (e.g. artifact published, contribution submitted) | Back link or panel close; view refreshes or shows new state |
| 5 | (Optional) Notification when async work completes | e.g. "Artifact anchored" or "DOI registered" | Toast or in-app notification |

**State sync**: When the user returns, the UI must reflect the latest state (e.g. artifact listed, contribution status). Avoid showing stale "Submit" when already submitted; use loading then updated state.

---

## 3. Affordances and Signifiers

### 3.1 Web Interfaces

| Element | Affordance | Signifier |
|---------|------------|-----------|
| Primary button | Clickable; main action | Filled brand color; cursor pointer; design token |
| Secondary button | Clickable; secondary action | Outlined or ghost; cursor pointer |
| Destructive button | Clickable; dangerous action | Error/destructive color; often in confirmation modal |
| Disabled state | Not interactable | Reduced opacity; cursor not-allowed; aria-disabled |
| Link | Navigate | Underline or distinct color; cursor pointer; focus ring |
| Expandable section | Open/close | Chevron icon; aria-expanded; cursor pointer |
| Loading (button/form) | System working | Spinner or skeleton; button disabled |
| Loading (data view) | Data fetching | Skeleton rows/cards or spinner |
| Empty state | No data yet | Message + illustration + CTA |
| Error state | Something failed | Icon + text message; retry or primary action |
| Status (XP, level, badge) | Informational | Icon + text (never color alone) |

### 3.2 REST API

| Signal | Meaning | Example |
|--------|---------|---------|
| 200/201 | Success | Response body with resource or envelope |
| 400 | Client error (validation, bad request) | `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "details": […] } }` |
| 409 | Conflict | `{ "error": { "code": "CONFLICT", "message": "…" } }` |
| 422 | Domain or validation rule | `{ "error": { "code": "DOMAIN_ERROR", "message": "…" } }` |
| 503 | Service unavailable | `{ "error": { "code": "SERVICE_UNAVAILABLE", "message": "…" } }` |
| Pagination | List partial result | `meta.next_cursor`, `meta.has_more` or equivalent |

### 3.3 Embedded IDE

| Element | Affordance | Signifier |
|---------|------------|-----------|
| Editor | Editable text/code | Cursor; selection; syntax highlighting |
| Run / Build | Execute | Button; output panel |
| Publish / Submit | Commit artifact or contribution | Primary button; may show "Publishing…" |
| Close / Back | Exit to context | Button or X; may prompt if unsaved |
| Unsaved | Changes not persisted | Indicator (dot or label); confirm on close |

---

## 4. Feedback System

### 4.1 Feedback Events and Responses

| Event | Feedback Type | Message / Indicator | Duration |
|-------|---------------|----------------------|----------|
| Form submit start | Inline loading | Button disabled + spinner; "Saving…" | Until response |
| Save / update success | Toast | "Changes saved" (or context-specific) | 3–5 s auto-dismiss |
| Validation error (form) | Inline | Error under field; icon + text | Until corrected or dismiss |
| Submit contribution | Toast | "Contribution submitted" | 3–5 s |
| Publish artifact | Toast | "Artifact published" | 3–5 s |
| Long operation (e.g. anchoring, DOI) | Status text / banner | "Anchoring artifact…" / "Registering DOI…" | Until complete or failure |
| Long operation complete | Toast or notification | "Artifact anchored" / "DOI registered" | 3–5 s or persistent until read |
| Background task failed | Toast or notification | "Something went wrong. We'll retry." or "Failed: [actionable message]" | 5 s or until dismissed |
| Contribution rejected | In-app notification + optional email | "Your contribution wasn’t accepted" + link to feedback | Persistent until read |
| Session expired | Modal or banner | "Session expired. Please sign in again." | Until dismissed + re-auth |
| 404 / not found | Page or inline | "We couldn’t find that [resource]." + CTA (e.g. "Go to Learn") | Persistent |
| 5xx / unexpected | Toast or page | "Something went wrong. Try again. Reference: [id]" | Until retry or leave |

### 4.2 Notification Channels

| Event | Channel | Urgency |
|-------|---------|---------|
| Contribution accepted / rejected | In-app notification; optional email | Normal |
| Comment or mention | In-app notification; optional email | Normal |
| Async job done (e.g. DOI registered) | In-app notification or toast | Low |
| Moderation action (for affected user) | In-app notification; email for serious actions | Normal / High |
| Security (e.g. password change) | Email + in-app | High |

### 4.3 Routing Rules (When to Use What)

| Situation | Use |
|-----------|-----|
| Success after local action (save, submit) | Toast |
| Validation error on current form | Inline under field |
| Error that blocks current view (e.g. session expired) | Modal or banner |
| Background or async completion | Toast or in-app notification |
| Destructive confirmation | Modal with clear consequence text |
| Global or non-blocking message | Toast (top-right or bottom) |
| User must take action (e.g. view feedback) | In-app notification (persistent until read) |

---

## 5. State Designs

### 5.1 Loading States

| Component / View | Loading State Design |
|------------------|----------------------|
| Portfolio / recommendations | Skeleton cards or rows; shimmer optional |
| Track / course list | Skeleton list items |
| Fragment content | Skeleton for title + body + artifact area |
| Form submission | Button disabled + spinner; form read-only |
| IDE load | Spinner or skeleton editor area |
| Table / list (e.g. issues, projects) | Skeleton rows (3–5) |

### 5.2 Empty States

| View | Empty State Message | Call to Action |
|------|---------------------|-----------------|
| Portfolio | "Your portfolio will build as you contribute." | "Go to Learn" / "Explore Hub" |
| Recommendations | "Complete a fragment or contribution to get suggestions." | "Go to Learn" / "Explore Hub" |
| Active tracks | "You haven’t started any track yet." | "Discover tracks" |
| Open issues (project) | "No open issues yet." | "Create first issue" (if maintainer) |
| Search results | "No results for \"[query]\"" | "Clear search" / "Try different terms" |
| Notifications | "No notifications yet." | — |
| Admin queue | "No items awaiting review." | — |

### 5.3 Error States

| Error | Heading | Body | Primary Action |
|-------|---------|------|-----------------|
| 404 | "Page not found" | "The page you're looking for doesn't exist or was moved." | "Go to home" / "Go to Learn" |
| 500 / unexpected | "Something went wrong" | "We're working on it. Reference: [id]. Try again in a few minutes." | "Try again" |
| Unauthorized | "Access denied" | "You don't have permission to view this." | "Go to home" / "Request access" |
| Service unavailable | "Temporarily unavailable" | "We're having trouble. Please try again in a few minutes." | "Try again" |
| Network error | "Connection problem" | "Check your connection and try again." | "Try again" |

---

## 6. Form Interaction Design

### 6.1 Validation Strategy

- **When to validate**: On blur for most fields; on submit validate all. For length-limited fields (e.g. character count), optional live count.
- **Error display**: Directly beneath the field; icon + text (not only color or border).
- **Required indicator**: Asterisk (*) or "Required" label; legend at top of form if needed.
- **Submit behavior**: On submit, validate all; scroll to first error if not in view; do not submit until valid or show clear summary of errors.

### 6.2 Form Field Patterns

| Field Type | Label Position | Validation Trigger | Error Placement |
|------------|----------------|--------------------|-----------------|
| Text input | Above field | On blur; on submit | Below field |
| Dropdown / Select | Above field | On change; on submit | Below field |
| Checkbox | Right of checkbox | On change | Below checkbox group |
| Radio group | Above group | On change | Below group |
| File upload | Above dropzone | On selection / submit | Below dropzone |
| Rich text (e.g. article) | Above editor | On submit | Below editor or inline |

---

## 7. Confirmation and Destructive Actions

| Action | Confirmation Pattern | Warning Text |
|--------|----------------------|--------------|
| Publish article version (Labs) | Modal: "Publish this version?" | "This version will be immutable and get a DOI. You can publish a new version later." |
| Reject contribution | Modal or inline: optional feedback form | "Reject this contribution? You can add feedback for the contributor." |
| Delete / remove (context-dependent) | Modal: describe scope | "This will [describe]. This cannot be undone." (if irreversible) |
| Leave unsaved (e.g. IDE, form) | Browser or app dialog | "You have unsaved changes. Are you sure you want to leave?" |
| Admin: revoke role / apply sanction | Modal | "This will [describe impact]. Confirm?" |

---

## 8. Motion and Animation

### 8.1 Principles

- **Purpose over decoration**: Animations indicate state change, guide attention, or confirm action.
- **Duration**: Micro-interactions 100–200 ms; page/panel transitions 200–400 ms; complex sequences ≤ 600 ms.
- **Respect `prefers-reduced-motion`**: Provide no-motion or reduced-motion fallback (e.g. instant transition).

### 8.2 Defined Animations

| Interaction | Animation | Purpose |
|-------------|-----------|---------|
| Modal open | Fade in + slight scale (e.g. 0.98 → 1) | Focus attention |
| Modal close | Fade out | Dismiss |
| Toast appear | Slide in (e.g. from top-right) | Non-blocking notice |
| Skeleton loading | Shimmer (gradient sweep) | Indicate loading without spinner |
| Button press | Brief scale or opacity change | Feedback |
| Page/panel transition | Fade or short slide | Context change |

---

## 9. Traceability

| Interaction Flow | Vision Workflow | Architecture Component |
|------------------|-----------------|-------------------------|
| Flow 1: Onboarding to first contribution | Section 8, Workflow 2 | Learn (content, fragments); Platform (portfolio, recommendation); Identity (auth) |
| Flow 2: Learning to contribution | Section 8, Workflow 1 | Learn; Hub (issues, contributions); Platform (event bus, recommendation) |
| Flow 3: Contribution rejected / validation error | Section 8, Workflow 6 | Hub (contributions, moderation); REST envelope |
| Flow 4: Track to complete project | Section 8, Workflow 3 | Learn (tracks, fragments, IDE) |
| Flow 5: Discover and contribute | Section 8, Workflow 6 | Hub (public square, projects, issues, IDE) |
| Flow 6: Create institution | Section 8, Workflow 5 | Hub (institution, project, issue); DIP (governance) |
| Flow 7: Scientific publication | Section 8, Workflow 7 | Labs (laboratory, research line, article, review, DOI) |
| Flow 8: IDE entry/exit | Section 4 (Embedded IDE) | platform/embedded-ide; Learn, Hub, Labs integration |

---

## 10. Open Questions

1. **Command palette (e.g. Ctrl+K)**: Whether to implement global search/command palette in first release; if yes, document in keyboard shortcuts and accessibility.
2. **Email frequency**: Default preferences for notification email frequency (e.g. digest vs immediate) to be defined in product settings.
3. **Admin health view**: Read-only vs actionable (e.g. trigger replay) to be aligned with platform observability.
