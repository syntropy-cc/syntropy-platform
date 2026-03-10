# Vision Quality Assessment Skill

## Skill Identity

| Property | Value |
|---|---|
| **Skill ID** | SKL-VQA |
| **Location** | `.cursor/skills/vision-quality-assessment.md` |
| **Category** | Vision Governance |
| **Invoked By** | Prompt 00 (primary), Prompt 01 (pre-check), Vision Analyst Agent |
| **Rules Governing This Skill** | `.cursor/rules/vision/vision-quality.mdc` |

---

## Purpose

Evaluate a Vision Document against a formal quality rubric, produce a structured quality report, and classify the document as Ready, Needs Improvement, or Insufficient for architecture generation.

This skill is the primary quality gate protecting the architecture generation phase from receiving underspecified input.

---

## Trigger Conditions

Invoke this skill when:
- The user opens Prompt 00 (Vision Refinement) — always invoke at the start
- The user opens Prompt 01 (Generate Architecture) — invoke as a feasibility pre-check before any architecture analysis begins
- The Vision Analyst Agent is working with the user to improve a Vision Document — invoke before and after improvement sessions to show progress

---

## Input Contract

| Input | Location | Required | Notes |
|---|---|---|---|
| Vision Document | `docs/VISION.md` | Required | Must exist at this path. If missing, halt and instruct the user to create it using `.cursor/templates/vision/VISION-TEMPLATE.md` |
| Quality Report Template | `.cursor/templates/vision/VISION-QUALITY-REPORT-TEMPLATE.md` | Required | Used to structure the output |
| Quality Rules | `.cursor/rules/vision/vision-quality.mdc` | Required | Governs all scoring criteria |

---

## Execution Steps

### Step 1 — Confirm input availability

1. Check that `docs/VISION.md` exists
2. If it does not exist: halt, report "Vision Document not found at `docs/VISION.md`", instruct the user to copy `.cursor/templates/vision/VISION-TEMPLATE.md` to `docs/VISION.md` and fill it in
3. Read `docs/VISION.md` in full
4. Read `.cursor/rules/vision/vision-quality.mdc` — this governs all scoring

### Step 2 — Identify document structure

1. Check which sections of the Vision Template are present in the document
2. Note any sections that appear missing or empty
3. Note the document's last-updated date for the report

### Step 3 — Score each dimension

Apply the scoring criteria from `vision-quality.mdc` (VQ-D01 through VQ-D11) to score each dimension 1–5:

For each dimension:
1. Read the corresponding section in `docs/VISION.md`
2. Apply the rubric criteria from the rules file
3. Assign a score (1–5)
4. Document what is present (positive findings)
5. Document what is missing or weak (gaps with severity: Critical / High / Medium / Low)
6. Write a specific, actionable recommendation

**Scoring rules**:
- Score based on what is actually written, not what you can infer
- If a section uses template placeholder text (curly braces like `{Actor 1}`) without filling it in, score it 1
- If a section is marked "N/A" or "Single component — not applicable", check if that is correct before accepting it
- For VQ-D11 (Component Visions): if the document describes multiple interfaces in Section 4 but Section 5 is marked N/A or empty, score it 2 and flag it as a gap

### Step 4 — Calculate total score and verdict

1. Sum all dimension scores (maximum 55)
2. Check critical dimension minimums (VQ-D03, VQ-D04, VQ-D05, VQ-D07 must each be ≥ 3)
3. Apply classification from VQ-002:
   - Ready: total ≥ 38 AND all critical ≥ 3
   - Needs Improvement: total 28–37 AND all critical ≥ 3
   - Insufficient: total < 28 OR any critical < 3

### Step 5 — Compile gap inventory

1. List all identified gaps
2. Sort by severity: Critical → High → Medium → Low
3. For each gap: include dimension ID, description, architecture impact, and recommended action

### Step 6 — Produce the quality report

1. Read `.cursor/templates/vision/VISION-QUALITY-REPORT-TEMPLATE.md`
2. Fill in the template with all scores, findings, and recommendations
3. Write the report to `docs/VISION-QUALITY-REPORT.md`

### Step 7 — Apply verdict action

Based on the verdict:

**Insufficient**:
- Present the verdict and top 3 critical gaps prominently
- State: "Architecture generation cannot proceed until critical gaps are resolved."
- Direct user to Prompt 00 for guided remediation
- Do NOT proceed with any architecture analysis

**Needs Improvement**:
- Present the verdict with a numbered list of improvement recommendations
- Ask: "Would you like to address these gaps first (strongly recommended) or proceed with the current document?"
- If user chooses to proceed: note all High+ gaps explicitly at the start of the architecture generation, document assumptions being made

**Ready**:
- Present a brief confirmation: "Vision Document quality: Ready (score: N/55)"
- Note any Medium/Low gaps as optional improvements
- Proceed normally

---

## Output Contract

| Output | Location | Format |
|---|---|---|
| Vision Quality Report | `docs/VISION-QUALITY-REPORT.md` | Filled `VISION-QUALITY-REPORT-TEMPLATE.md` |
| Verdict | Presented in conversation | Ready / Needs Improvement / Insufficient |
| Prioritized gap list | Presented in conversation | Ordered list with severity labels |

---

## Failure Modes

| Failure | Response |
|---|---|
| `docs/VISION.md` does not exist | Halt; instruct user to create the document using the Vision Template |
| Vision Document exists but is entirely empty or contains only template placeholders | Score all dimensions as 1; verdict: Insufficient |
| Vision Document format does not match the template | Score based on content found; note the format deviation; do not fail just because section numbers differ |
| Score calculation produces a borderline result (27 vs 28) | Apply the lower classification; err toward more caution |

---

## Re-scoring Protocol

After the user updates `docs/VISION.md` during a Prompt 00 session:

1. Re-run this skill from Step 1
2. Show score comparison: Before → After for each changed dimension
3. Update `docs/VISION-QUALITY-REPORT.md` with the new scores
4. Add a changelog entry to the report noting the session date and what changed
5. Re-classify and present the new verdict
