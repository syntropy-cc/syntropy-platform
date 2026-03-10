**Assess the Vision Document at `docs/vision/VISION.md` for quality and completeness, then guide me through improving any identified gaps.**

> This prompt requires no additional user input. It reads `docs/vision/VISION.md`, evaluates it, and conducts an interactive refinement session. Just paste this prompt into a new Cursor conversation and send.

### Context and authority

- **Vision Document is the root of everything**: `docs/vision/VISION.md` (using `.cursor/templates/vision/VISION-TEMPLATE.md`, which has 12 sections) feeds all downstream phases. A weak vision produces weak architecture.
- **Your role in this session**: you are the Vision Analyst Agent (`.cursor/agents/vision-analyst.md`). Read the agent definition before proceeding.
- **Quality gate**: architecture generation (Prompt 01) will check this document's quality automatically. This session helps ensure it passes.

### Agent definition

Before doing anything else, read the Vision Analyst Agent definition:

- **Vision Analyst Agent**: `.cursor/agents/vision-analyst.md`

Apply this agent's role, interaction protocol, and boundaries throughout the session.

### Skill to invoke

Invoke this skill as your first action:

- **Vision Quality Assessment**: `.cursor/skills/vision-quality-assessment.md`

Read the skill definition completely. Follow its execution steps to assess `docs/vision/VISION.md` and produce `docs/vision/VISION-QUALITY-REPORT.md`.

### Rules you must follow

- **Vision quality rules**: `.cursor/rules/vision/vision-quality.mdc` (scoring dimensions, thresholds, remediation guidance)

### Templates you must use

- **Vision Template** (reference for what the document should contain): `.cursor/templates/vision/VISION-TEMPLATE.md`
- **Vision Quality Report Template** (structure for the output report): `.cursor/templates/vision/VISION-QUALITY-REPORT-TEMPLATE.md`

---

### Execution model: Assess first, then guide interactively

This session does NOT follow the Plan → Execute model. It follows an Assess → Guide → Improve cycle:

1. **Assess**: invoke the Vision Quality Assessment Skill; produce the quality report; write it to `docs/vision/VISION-QUALITY-REPORT.md`
2. **Present**: show the verdict, score table, and top improvement recommendations to the user
3. **Guide**: work through improvements interactively — ask questions, transcribe answers, update the Vision Document section by section (with user approval)
4. **Re-assess**: after improvements, re-run the skill and show the updated scores
5. **Declare readiness**: when the document reaches a Ready verdict, confirm and direct the user to Prompt 01

---

### What you must do (mandatory steps, in order)

#### Step 1 — Read the agent and skill definitions

1. Read `.cursor/agents/vision-analyst.md` — this defines your role and interaction protocol
2. Read `.cursor/skills/vision-quality-assessment.md` — this defines the assessment procedure
3. Read `.cursor/rules/vision/vision-quality.mdc` — this defines all scoring criteria

#### Step 2 — Run the Vision Quality Assessment

1. Follow the Vision Quality Assessment Skill execution steps exactly
2. Write the completed report to `docs/vision/VISION-QUALITY-REPORT.md`

#### Step 3 — Present the assessment to the user

Present clearly:

1. **Verdict**: READY / NEEDS IMPROVEMENT / INSUFFICIENT (with total score N/55)
2. **Score table**: all 11 dimensions with scores and pass/fail status
3. **Top improvement opportunities**: 3–5 specific, actionable recommendations in priority order

**If verdict is READY**:
- Congratulate the user
- Note any Medium/Low gaps as optional improvements
- State: "Your Vision Document is ready for architecture generation. Use Prompt 01 to proceed."
- Ask if the user wants to make any optional improvements anyway

**If verdict is INSUFFICIENT**:
- State clearly: "Architecture generation cannot proceed until the critical gaps below are resolved."
- Lead directly into the improvement workflow (Step 4)

**If verdict is NEEDS IMPROVEMENT**:
- Explain the gaps and why they matter for architecture quality
- Recommend improving before proceeding
- Ask: "Would you like to work through these improvements now? I estimate it will take [N] focused questions."

#### Step 4 — Guide improvements (if needed)

For each gap in severity order (Critical → High → Medium):

1. Introduce the gap: "Section [N] — [Name]: [brief explanation of what is missing]"
2. Ask focused questions following the Vision Analyst interaction protocol (`.cursor/agents/vision-analyst.md`)
3. After the user responds, show them the proposed Vision Document text before writing it
4. Write the approved text to `docs/vision/VISION.md`
5. Move to the next gap

Work through gaps systematically. Do not skip a Critical or High gap to work on a lower priority one.

#### Step 5 — Re-score after improvements

After the user is satisfied with the improvements made:

1. Re-run the Vision Quality Assessment Skill
2. Show the before/after comparison:

| Dimension | Score Before | Score After | Change |
|---|---|---|---|
| {Dimension} | {N} | {N} | {+N / No change} |
| ... | | | |
| **Total** | **{N}/55** | **{N}/55** | **{+N}** |

3. Update `docs/vision/VISION-QUALITY-REPORT.md` with the new scores
4. Add a changelog entry to the report noting today's date and what was improved

#### Step 6 — Declare readiness and direct to next step

State the final verdict:

- **If now Ready**: "Vision Document quality: Ready (N/55). Proceed to architecture generation with Prompt 01."
- **If Needs Improvement**: "Vision Document quality: Needs Improvement (N/55). Architecture generation is possible but quality will be limited by these remaining gaps: [list]. Proceed with Prompt 01 when ready, or continue improving here."
- **If still Insufficient**: "The following critical gaps must still be resolved before proceeding: [list]. Shall we continue?"

### Verification checklist

- [ ] Vision Analyst Agent definition read
- [ ] Vision Quality Assessment Skill followed exactly
- [ ] Quality report written to `docs/vision/VISION-QUALITY-REPORT.md`
- [ ] Verdict and scores presented clearly to user
- [ ] Improvements guided interactively with user approval before writing to `docs/vision/VISION.md`
- [ ] Final re-score produced and shown
- [ ] Next step clearly stated

### Language

Write everything in English: all assessment, questions, proposed text, reports, planning, and reasoning.
