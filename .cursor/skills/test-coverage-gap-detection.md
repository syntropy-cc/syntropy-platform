# Test Coverage Gap Detection Skill

## Skill Identity

| Property | Value |
|---|---|
| **Skill ID** | SKL-TESTGAP |
| **Location** | `.cursor/skills/test-coverage-gap-detection.md` |
| **Category** | Quality Assurance |
| **Invoked By** | Prompt 06 (Quality Audit), Test Engineer Agent |
| **Rules Governing This Skill** | All rules in `.cursor/rules/tests/` (TEST-001 through TEST-018, UNIT-001 through UNIT-014, INT-001 through INT-015, E2E-001 through E2E-013, MOCK-001 through MOCK-014, DATA-001 through DATA-012) |

---

## Purpose

Identify gaps between what the system is supposed to do (acceptance criteria in component records) and what is actually verified by tests. Assess the test pyramid distribution and flag common test anti-patterns.

This skill is a gap detector, not a test runner — it analyzes test file structure, names, and patterns through code reading, not execution.

---

## Trigger Conditions

Invoke this skill when:
- Prompt 06 (Quality Audit) begins — invoked by the Test Engineer Agent
- A developer wants to assess test coverage before moving from Phase 6 to Phase 7

---

## Input Contract

| Input | Location | Required | Notes |
|---|---|---|---|
| Test files | `tests/` directory tree | Required | All test files |
| Component records | `docs/implementation/components/COMP-*.md` | Required | Acceptance criteria are extracted from these |
| Implementation Plan | `docs/implementation/IMPLEMENTATION-PLAN.md` | Required | Current stage and completion status |
| Testing strategy rules | `.cursor/rules/tests/testing-strategy.mdc` | Required | Governs evaluation criteria |
| All other test rules | `.cursor/rules/tests/` | Required | Used to identify anti-patterns |

---

## Execution Steps

### Step 1 — Inventory component records and acceptance criteria

1. Read all component records in `docs/implementation/components/COMP-*.md`
2. For each component record marked as "Done" or "In Progress" in the Implementation Plan:
   - Extract all acceptance criteria items
   - Record the component ID, item ID, and acceptance criterion text
3. Build a map: {COMP-X.Y item ID} → {acceptance criterion text}

### Step 2 — Inventory test files

1. Scan `tests/` directory tree recursively
2. For each test file:
   - Record file path and inferred test level (unit/component/integration/e2e based on directory path and file naming)
   - List all test function names (functions starting with `test_` in Python, `it(` or `describe(` patterns in JS/TS, `Test` prefix in Go, etc.)
3. Build a map: {test file path} → {list of test function names}

### Step 3 — Map acceptance criteria to tests

For each acceptance criterion from Step 1:

1. Search test function names and test file names for coverage of this criterion
2. Use keyword matching: extract key nouns and verbs from the criterion text; look for them in test names
3. Classify each criterion as:
   - **Covered**: at least one test function appears to verify this criterion
   - **Uncertain**: a test exists that might cover this criterion but the naming is ambiguous
   - **Not covered**: no test appears to verify this criterion

Report all "Not covered" and "Uncertain" items.

### Step 4 — Assess test pyramid distribution

Count tests by level:

| Level | Target % | How to identify |
|---|---|---|
| Unit | ~60% | `tests/unit/` directory or `test_*_unit.py` or similar naming |
| Component | ~20% | `tests/component/` or similar |
| Integration | ~15% | `tests/integration/` directory or `@pytest.mark.integration` |
| E2E | ~4% | `tests/e2e/` or `tests/end-to-end/` |
| Real-world | ~1% | `@pytest.mark.real_world` or similar |

Report distribution percentages vs. TEST-004 targets. Flag significant deviations.

### Step 5 — Detect common test anti-patterns

Scan test function names and files for these violations:

**TEST-003 violations** (non-deterministic tests):
- Look for `time.time()`, `datetime.now()`, `random.random()` calls without mocking context
- Look for `sleep()` or `time.sleep()` calls in test functions (suggests timing-dependent tests)
- Look for network calls outside of integration test directories

**TEST-001 violations** (poor test naming):
- Test functions named `test_function_name()` without behavior description
- Single-word test names like `test_create()`, `test_update()`
- Test names that describe implementation (`test_calls_save_method`) rather than behavior

**TEST-002 violations** (test independence):
- Test files with module-level state mutation
- Tests that appear to depend on execution order (numbered tests: `test_1_setup`, `test_2_action`)
- Shared mutable fixtures without proper teardown

**TEST-008 violations** (single concept per test):
- Test functions that are very long (>50 lines) suggest multiple concepts being tested

**TEST-016 violations** (assertion quality):
- Tests with `assert result is not None` as the only assertion
- Tests checking truthiness (`assert result`) rather than specific values

### Step 6 — Check coverage thresholds by component type

For each component, classify its type and check the TEST-009 coverage targets:

| Component Type | Line Coverage Target | Branch Coverage Target |
|---|---|---|
| Domain logic | 90% | 85% |
| Application services | 85% | 80% |
| API endpoints | 80% | 75% |
| Infrastructure | 70% | 60% |
| Utilities | 90% | 85% |

Note: This skill cannot run coverage tools — it assesses structural coverage through test name analysis. Flag components that have very few tests relative to the number of acceptance criteria.

### Step 7 — Compile the Test Coverage Gap Report

```
## Test Coverage Gap Report

**Assessment Date**: {date}
**Component Records Analyzed**: {N}
**Total Acceptance Criteria Evaluated**: {N}
**Test Files Scanned**: {N}
**Total Test Functions Found**: {N}

### Pyramid Distribution

| Level | Count | % of Total | Target % | Status |
|---|---|---|---|---|
| Unit | {N} | {N}% | 60% | {On track / Under / Over} |
| Component | {N} | {N}% | 20% | {Status} |
| Integration | {N} | {N}% | 15% | {Status} |
| E2E | {N} | {N}% | 4% | {Status} |

### Acceptance Criteria Coverage

**Covered**: {N} criteria ({N}%)
**Uncertain**: {N} criteria ({N}%)
**Not Covered**: {N} criteria ({N}%)

#### Not Covered (priority: implement these tests)

| Criterion | Component | Item ID | Why It Matters |
|---|---|---|---|
| {Criterion text} | COMP-X | COMP-X.Y | {Domain logic / API / Core path / etc.} |

#### Uncertain Coverage

| Criterion | Component | Closest Test | Why Uncertain |
|---|---|---|---|
| {Criterion text} | COMP-X | {test_file:test_name} | {Naming too generic to confirm} |

### Anti-Pattern Findings

| Violation | Rule | Location | Description |
|---|---|---|---|
| Non-deterministic | TEST-003 | {file:function} | {Description} |
| Poor naming | TEST-001 | {file:function} | {Description} |
| Vague assertion | TEST-016 | {file:function} | {Description} |

### Recommendations

1. **[High]** Implement missing tests for: {list top 3 most critical uncovered criteria}
2. **[High]** Review uncertain coverage for: {list top 3}
3. **[Medium]** Fix anti-patterns: {count} violations found (see list above)
4. **[Low]** Pyramid distribution: {recommendation if skewed}
```

---

## Output Contract

| Output | Format | Notes |
|---|---|---|
| Test Coverage Gap Report | Presented in conversation | Structured report with all findings |
| Uncovered criteria list | Part of report | Prioritized by component type importance |
| Anti-pattern list | Part of report | With file locations |

---

## Failure Modes

| Failure | Response |
|---|---|
| `tests/` directory does not exist | Report "No test directory found"; flag as Critical gap; recommend running implementation stages before quality audit |
| No component records found | Skip acceptance criteria mapping; report pyramid distribution only; note that traceability cannot be assessed |
| Test files exist but follow non-standard naming | Do best-effort analysis; note that test identification may be incomplete |
| Component records have no acceptance criteria | Note which records are missing acceptance criteria; recommend updating them |
