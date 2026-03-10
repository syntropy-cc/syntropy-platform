# Tutorial Page Template

> Tutorials are **learning-oriented**. They guide the reader through a complete experience from start to finish. The reader should achieve something meaningful by the end.

## Template

```markdown
# Tutorial: {Descriptive Title}

> **What you'll learn**: {One sentence describing the outcome}
>
> **Prerequisites**: {What the reader needs before starting}
>
> **Time**: {Estimated time to complete, e.g., "~15 minutes"}

## Overview

{1-2 paragraphs explaining what the reader will build/do and why it matters. Set expectations — what they will have at the end.}

## Before You Begin

{List prerequisites with links to installation or setup pages:}

- [ ] {Prerequisite 1} — [Installation guide](../getting-started/installation.md)
- [ ] {Prerequisite 2}
- [ ] {Prerequisite 3}

## Step 1: {Action Verb + What}

{Brief explanation of what this step accomplishes and why.}

{Code block or instructions:}

```{language}
{command or code}
```

{Expected result or output:}

```
{expected output}
```

{Brief explanation of the result if not obvious.}

## Step 2: {Action Verb + What}

{Continue the pattern. Each step should:}
{- Start with an action verb (Create, Configure, Run, Add)}
{- Do exactly one thing}
{- Show the exact command or code}
{- Show the expected result}
{- Explain anything non-obvious}

## Step 3: {Action Verb + What}

{Continue...}

## Verify Your Result

{Show the reader how to confirm everything worked:}

```{language}
{verification command or check}
```

{Expected final state:}

```
{expected final output}
```

## What You've Learned

{Summarize what the reader accomplished:}

- ✓ {Learning outcome 1}
- ✓ {Learning outcome 2}
- ✓ {Learning outcome 3}

## Next Steps

- {Suggested next tutorial or how-to guide with link}
- {Link to reference for deeper exploration}
- {Link to related concept page}

## See Also

- [{Related Reference}](../reference/{page}.md)
- [{Related Concept}](../concepts/{page}.md)
- [{Related How-to}](../how-to/{page}.md)
```

## Writing Guidelines

1. **Never skip a step** — even if it seems obvious. The reader is learning.
2. **Use realistic data** — not "foo" or "test". Use domain-appropriate examples.
3. **Show every output** — the reader needs to verify they are on track.
4. **Keep it linear** — no branches, no "if you want X do this, otherwise do that". One path.
5. **End with success** — the tutorial must work. Test it before publishing.
6. **Link forward** — always point to what the reader should do next.

## Traceability

| Field | Value |
|-------|-------|
| **Vision Capability** | {Which vision capability this tutorial demonstrates} |
| **Architecture Domain** | {Which domain this tutorial exercises} |
| **Components Involved** | {Which implementation components are used} |
