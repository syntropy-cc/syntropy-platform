**Conduct a quality audit of the implementation — assessing test coverage, architecture compliance, and code-architecture alignment — and produce a combined Quality Audit Report.**

> This prompt requires no additional user input. It reads `src/`, `tests/`, `docs/architecture/`, and `docs/implementation/` to assess quality. Just paste this prompt into a new Cursor conversation and send.

### Context and authority

- **Quality gates exist to protect the user documentation phase**: user documentation should describe a well-implemented, well-tested, architecturally-sound system. Auditing before Phase 7 prevents documenting defects.
- **Two specialized agents collaborate in this session**: the Test Engineer Agent assesses test quality; the Architecture Compliance Auditor Agent assesses architectural compliance.
- **Combined verdict determines whether to proceed**: Critical failures in either assessment block Phase 7.

### Agent definitions — read both before proceeding

1. **Test Engineer Agent**: `.cursor/agents/test-engineer.md`
2. **Architecture Compliance Auditor Agent**: `.cursor/agents/architecture-compliance-auditor.md`

### Skills to invoke

Both agents invoke their respective skills. Read both skill definitions:

1. **Test Coverage Gap Detection** (`.cursor/skills/test-coverage-gap-detection.md`): used by the Test Engineer Agent
2. **Architecture Validation** (`.cursor/skills/architecture-validation.md`): used by the Architecture Compliance Auditor Agent
3. **Implementation Compliance Audit** (`.cursor/skills/implementation-compliance-audit.md`): used by the Architecture Compliance Auditor Agent

### Rules you must follow

**Testing rules**:
- `.cursor/rules/tests/testing-strategy.mdc` (TEST-001 through TEST-018)
- `.cursor/rules/tests/unit-testing.mdc`
- `.cursor/rules/tests/integration-testing.mdc`
- `.cursor/rules/tests/e2e-contract-testing.mdc`
- `.cursor/rules/tests/mocking-test-doubles.mdc`
- `.cursor/rules/tests/test-data-fixtures.mdc`

**Architecture rules**:
- `.cursor/rules/architecture/architecture.mdc` (ARCH-001 through ARCH-010)
- `.cursor/rules/architecture/architecture-navigation.mdc` (NAV-001 through NAV-014)

**Implementation rules**:
- `.cursor/rules/implementation/coding-standards.mdc` (CODE-001 through CODE-021)

---

### Execution model: Assess both dimensions, then combine

This session runs two independent assessments and combines them:

1. **Test coverage assessment** (Test Engineer Agent): analyze `tests/` vs. component records
2. **Architecture compliance assessment** (Architecture Compliance Auditor Agent): analyze `src/` vs. architecture documentation
3. **Combined verdict**: aggregate both assessments into a single Quality Audit Report
4. **Present to user**: show the combined report, verdict, and prioritized action list

---

### What you must do (mandatory steps, in order)

#### Step 1 — Read all agent and skill definitions

1. Read `.cursor/agents/test-engineer.md`
2. Read `.cursor/agents/architecture-compliance-auditor.md`
3. Read `.cursor/skills/test-coverage-gap-detection.md`
4. Read `.cursor/skills/architecture-validation.md`
5. Read `.cursor/skills/implementation-compliance-audit.md`

#### Step 2 — Run the Test Engineer assessment

Acting as the Test Engineer Agent:

1. Follow the Test Engineer Agent's interaction protocol
2. Invoke the Test Coverage Gap Detection Skill (`SKL-TESTGAP`) per its execution steps
3. Produce the Test Coverage Gap Report
4. Determine the test verdict (Pass / Pass with Warnings / Fail)

#### Step 3 — Run the Architecture Compliance assessment

Acting as the Architecture Compliance Auditor Agent:

1. Follow the Architecture Compliance Auditor Agent's compliance check protocol
2. Invoke the Architecture Validation Skill (`SKL-ARCHVAL`) per its execution steps
3. Invoke the Implementation Compliance Audit Skill (`SKL-IMPLCOMP`) per its execution steps
4. Run the additional compliance checks (Checks 3–5 from the agent definition)
5. Produce the Architecture Compliance Report
6. Determine the compliance verdict (Pass / Pass with Warnings / Fail)

#### Step 4 — Produce the combined Quality Audit Report

```
## Quality Audit Report

**Audit Date**: {date}
**Implementation Stages Complete**: {N} of {N}
**Overall Verdict**: PASS / PASS WITH WARNINGS / FAIL

---

### Part 1: Test Coverage (Test Engineer)

**Test Verdict**: {Pass / Pass with Warnings / Fail}

{Test Coverage Gap Report content — pyramid distribution, uncovered criteria, anti-patterns}

---

### Part 2: Architecture Compliance (Architecture Compliance Auditor)

**Compliance Verdict**: {Pass / Pass with Warnings / Fail}

{Architecture Compliance Report content — documentation validation, code vs. architecture, layer violations}

---

### Part 3: Combined Assessment

**Blocker summary** (must resolve before Phase 7):
{List all Critical failures from both assessments}

**Warning summary** (recommended to resolve):
{List all High findings from both assessments}

**Prioritized action list**:
1. [Critical] {Action}
2. [Critical] {Action}
3. [High] {Action}
...

**Proceed to Phase 7?**: {Yes / Yes with warnings noted / No — resolve blockers first}
```

#### Step 5 — Present verdict and next steps

**If overall verdict is PASS**:
- "Quality audit passed. Proceed to user documentation generation with Prompt 07."
- Note any warnings for the user's awareness

**If overall verdict is PASS WITH WARNINGS**:
- "Quality audit passed with warnings. You may proceed to Prompt 07, but consider resolving these issues for a higher quality system."
- List the warning items in priority order

**If overall verdict is FAIL**:
- "Quality audit failed. Resolve the following critical issues before generating user documentation."
- List blockers with specific resolution guidance
- "After resolving, run this prompt again to confirm the issues are resolved."

### Combined verdict logic

| Overall | Criteria |
|---|---|
| **Pass** | Both test and compliance verdicts are Pass |
| **Pass with Warnings** | Both verdicts are Pass or Pass with Warnings (at least one is Pass with Warnings); no Critical failures in either |
| **Fail** | Either verdict is Fail; OR there are Critical failures in either assessment |

### Verification checklist

- [ ] Both agent definitions read
- [ ] All three skill definitions read
- [ ] Test Coverage Gap Detection Skill invoked and report produced
- [ ] Architecture Validation Skill invoked and report produced
- [ ] Implementation Compliance Audit Skill invoked and report produced
- [ ] Combined Quality Audit Report produced and presented
- [ ] Overall verdict stated clearly (Pass / Pass with Warnings / Fail)
- [ ] Next step clearly stated

### Language

Write everything in English: all assessment, reports, findings, recommendations, and reasoning.

---

