# Interaction Design — {Project Name}

> **Document Type**: Interaction Design  
> **Project**: {Project Name}  
> **Interface Types**: {List all applicable}  
> **Created**: {YYYY-MM-DD}  
> **Last Updated**: {YYYY-MM-DD}  
> **Interaction Designer**: (AGT-IXD if AI-generated)  
> **UX Principles Reference**: `docs/ux/UX-PRINCIPLES.md`  
> **Architecture Reference**: `docs/architecture/ARCHITECTURE.md`

---

## 1. Interaction Flows

> *Document every significant interaction flow (any flow with > 2 steps, non-obvious error states, or representing a primary user workflow from the Vision Document). Source: Vision Document Section 8.*

### Flow 1: {Flow Name}

> **Type**: {Tutorial / Task / Setup / Recovery}  
> **User**: {Primary persona}  
> **Entry Point**: {Where the user begins}  
> **Success Exit**: {Where the user ends on success}  
> **Frequency**: {e.g., Daily / Weekly / Once (setup)}

#### Happy Path

| Step | User Action | System Response | Interface Element |
|------|-------------|----------------|------------------|
| 1 | {User does X} | {System shows Y} | {Button / Form / Command} |
| 2 | {User does X} | {System shows Y} | {Component} |
| N | {User sees success} | {System confirms} | {Success state} |

#### Error Paths

| Error Condition | System Response | Recovery Action |
|----------------|----------------|----------------|
| {Condition 1} | {Error message shown} | {What user can do} |
| {Condition 2} | {Error message shown} | {What user can do} |

#### Edge Cases

| Edge Case | Handling |
|-----------|---------|
| {User cancels midway} | {State is preserved / discarded / user is warned} |
| {Concurrent use} | {How conflicts are handled} |
| {Slow connection} | {Feedback given, timeout behavior} |

---

### Flow 2: {Flow Name}

*(Repeat structure above)*

---

## 2. Affordances and Signifiers

> *What UI signals help users understand how to interact with the system?*

### 2.1 For Web Interfaces

| Element | Affordance | Signifier |
|---------|-----------|----------|
| {Primary button} | {Clickable, triggers main action} | {Filled color, elevated style, cursor:pointer} |
| {Disabled state} | {Not interactable} | {Reduced opacity, cursor:not-allowed, aria-disabled} |
| {Expandable section} | {Can be opened/closed} | {Chevron icon, cursor:pointer} |
| {Loading} | {System is working} | {Spinner, skeleton, disabled controls} |

### 2.2 For CLI Interfaces

| Signal | Meaning | Example |
|--------|---------|---------|
| {Spinner} | {Long-running operation} | `⠋ Deploying...` |
| {✓ prefix} | {Success} | `✓ Pipeline created` |
| {✗ prefix} | {Failure} | `✗ Deployment failed` |
| {! prefix} | {Warning} | `! Version already exists` |
| {Exit code 0} | {Success} | (exit) |
| {Exit code 1+} | {Failure} | (exit) |

---

## 3. Feedback System

> *How does the system communicate to users at each stage?*

### 3.1 Feedback Events and Responses

| Event | Feedback Type | Message/Indicator | Duration |
|-------|-------------|------------------|---------|
| Form submitted | {Loading indicator} | {`Saving...`} | {Until complete} |
| Save success | {Success toast} | {`Changes saved`} | {3 seconds} |
| Save failure | {Inline error} | {Specific error message} | {Until dismissed} |
| Background task started | {Banner} | {`Pipeline running. We'll notify you when done.`} | {Auto-dismiss after 5s} |
| Long operation (>30s) | {Progress bar} | {`Deploying: step 2 of 5`} | {Until complete} |

### 3.2 Notification Channels

*(How are async events communicated to users?)*

| Event | Channel | Urgency |
|-------|---------|---------|
| {Task complete} | {In-app notification / email / both} | {Low / Normal / High} |
| {Failure requiring action} | {In-app notification + email} | {High} |
| {Security event} | {Email + in-app + SMS} | {Critical} |

---

## 4. State Designs

> *Every state that a user may encounter must be designed.*

### 4.1 Loading States

| Component / View | Loading State Design |
|-----------------|---------------------|
| {Data table} | {Skeleton rows (3 placeholder rows)} |
| {Dashboard metrics} | {Skeleton cards with shimmer animation} |
| {Form submission} | {Button disabled + spinner, form locked} |

### 4.2 Empty States

| View | Empty State Message | Illustration | Call to Action |
|------|-------------------|-------------|----------------|
| {Pipeline list} | {`You don't have any pipelines yet.`} | {Relevant illustration} | {`Create your first pipeline` → Create flow} |
| {Search results} | {`No results for "{query}"`} | {Search illustration} | {`Clear search` / `Try different terms`} |

### 4.3 Error States

| Error | Heading | Body | Primary Action |
|-------|---------|------|---------------|
| {404} | {`Page not found`} | {`The page you're looking for doesn't exist.`} | {`Go to dashboard`} |
| {500} | {`Something went wrong`} | {`We're working on it. Reference: {error-id}`} | {`Try again`} |
| {Unauthorized} | {`Access denied`} | {`You don't have permission to view this.`} | {`Request access`} |

---

## 5. Form Interaction Design

> *Only applicable for web systems with forms.*

### 5.1 Validation Strategy

- **When to validate**: On field blur (not as user types, except for length-constrained fields)
- **Error display**: Directly beneath the field; icon + text (not just red border)
- **Required indicator**: Asterisk (*) with legend "* required" at top of form
- **Submit behavior**: Validate all fields on submit; scroll to first error if not visible

### 5.2 Form Field Patterns

| Field Type | Label Position | Validation Trigger | Error Placement |
|-----------|---------------|-------------------|----------------|
| Text input | Above field | On blur | Below field |
| Dropdown | Above field | On change | Below field |
| Checkbox | Right of checkbox | On change | Below checkbox group |
| Radio group | Above group | On change | Below group |
| File upload | Above dropzone | On selection | Below dropzone |

---

## 6. Confirmation and Destructive Actions

| Action | Confirmation Pattern | Warning Text |
|--------|---------------------|-------------|
| {Delete resource} | {Modal dialog: type resource name} | {`This will permanently delete "{name}" and all associated data. This cannot be undone.`} |
| {Bulk delete (N items)} | {Modal dialog with count} | {`This will permanently delete {N} items. This cannot be undone.`} |
| {Leave unsaved form} | {Browser/app dialog} | {`You have unsaved changes. Are you sure you want to leave?`} |

---

## 7. Motion and Animation

> *Only applicable for web systems. Define intent, not implementation.*

### 7.1 Animation Principles

- **Purpose over decoration**: Every animation serves a purpose (show state change, guide attention, confirm action)
- **Duration**: Micro-interactions 100–200ms; page transitions 200–400ms; complex animations ≤ 600ms
- **Respect `prefers-reduced-motion`**: All animations must have a no-motion fallback

### 7.2 Defined Animations

| Interaction | Animation | Purpose |
|-----------|-----------|---------|
| {Modal open} | {Fade in + scale from 0.95} | {Draws attention, feels responsive} |
| {Toast notification} | {Slide in from top-right} | {Non-disruptive, visible} |
| {Loading skeleton} | {Shimmer (gradient sweep)} | {Shows activity without spinner} |

---

## 8. Traceability

| Interaction Flow | Vision Workflow | Architecture Component |
|----------------|----------------|----------------------|
| {Flow 1: Create Pipeline} | {Vision Section 8: "Create and run pipeline"} | {PipelineService, PipelineRepository} |

---

## 9. Open Questions

*(Issues or decisions not yet resolved.)*

1. {Question 1: e.g., "Should the pipeline run confirmation be modal or inline?"}
2. {Question 2}
