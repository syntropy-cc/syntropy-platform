# Architecture Brief

> **Purpose**: Confirmed Architecture Brief produced by Prompt 01-A. Governs all work in Prompts 01-B and 01-C.
> **Created by**: Prompt 01-A — Assess and Brief
> **Consumed by**: Prompt 01-B (Generate Architecture), Prompt 01-C (Decisions and Validation)
> **Status**: Active
> **Last updated**: {YYYY-MM-DD}

---

## Vision Quality

| Field | Value |
|-------|-------|
| **Verdict** | Ready / Needs Improvement / Insufficient |
| **Score** | {N}/55 |
| **Gaps carried as assumptions** | {list, or "none"} |

---

## Delivery Interfaces

| Interface | Primary / Secondary | Impact on layer structure |
|-----------|--------------------|-----------------------------|
| {name} | {P/S} | {one sentence} |

---

## Layer Structure

| Field | Value |
|-------|-------|
| **Chosen style** | {e.g., Clean Architecture, Hexagonal, Layered, Microservices} |
| **Rationale** | {cite specific inputs from Vision Sections 4, 9, 10} |

---

## Domains

| Domain | Responsibility | Owned Entities | Vision Capabilities (Section 6) |
|--------|---------------|----------------|----------------------------------|
| {name} | {one sentence} | {list} | {Section 6 references} |

---

## Documents to Generate

> Prompt 01-B will create these files.

- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/domains/{name}/ARCHITECTURE.md` _(one per domain)_
- `docs/architecture/cross-cutting/{concern}/ARCHITECTURE.md` _(one per concern)_
- `docs/architecture/platform/{interface}/ARCHITECTURE.md` _(one per interface)_
- `docs/architecture/diagrams/README.md`
- _{shared diagram files as needed}_

---

## Diagrams to Generate

| Location | Diagrams |
|----------|----------|
| Root document | Context/system diagram, layer/component overview, domain relationships |
| Per domain | ERD, component diagram, at least one sequence diagram |
| {other} | {description} |

---

## ADRs to Create

> Prompt 01-C will create these files.

| Working Title | Decision Subject |
|---------------|------------------|
| ADR-001-{architecture-style} | Layer structure and style choice |
| {additional ADR} | {technology, communication patterns, etc.} |

---

## Cross-Cutting Concerns

| Concern | Justification |
|---------|--------------|
| {concern name} | {why it was identified, e.g., "Security — Data Sensitivity flags PII in Section 10"} |

---

## Platform Documents

| Platform document | Delivery interface covered |
|-------------------|--------------------------|
| {path} | {interface type} |

---

## Ambiguities and Resolutions

| Ambiguity | Severity | Resolution |
|-----------|----------|------------|
| {description} | Critical / Significant / Minor | Asked / Assumed: {details} |

---

## Estimated Output

| Metric | Count |
|--------|-------|
| Documents | {N} |
| Diagrams | {N} |
| ADRs | {N} |
