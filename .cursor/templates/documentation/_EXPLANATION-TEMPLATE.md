# Explanation Page Template

> Explanation pages are **understanding-oriented**. They provide context, background, and reasoning about concepts in the system. They help the reader build a mental model — they do not give instructions or list specifications.

## Template

```markdown
# {Concept Name}

## What is {Concept Name}?

{2-3 paragraphs explaining the concept in plain language. Define what it is, what problem it solves, and why it exists in the system. Use analogies if helpful.}

## How {Concept Name} Works

{Explain the mechanism at a conceptual level. Use diagrams if the concept involves flow, relationships, or state changes.}

```mermaid
{diagram illustrating the concept}
```

{Walk through the diagram or explain the key parts.}

## Key Principles

{List the fundamental rules or properties the reader should understand:}

- **{Principle 1}**: {Explanation}
- **{Principle 2}**: {Explanation}
- **{Principle 3}**: {Explanation}

## {Concept Name} in Practice

{Show how the concept manifests in the system with a concrete, brief example. This is not a tutorial — it is an illustration.}

```{language}
{brief illustrative example}
```

{Explain what the example demonstrates about the concept.}

## Common Misconceptions

{Optional: address 1-3 things people often get wrong about this concept.}

- **"{Misconception}"** — {Correction and explanation}
- **"{Misconception}"** — {Correction and explanation}

## Related Concepts

{List concepts that relate to this one and briefly explain the relationship:}

- **[{Related Concept 1}](./{related-concept-1}.md)**: {How they relate}
- **[{Related Concept 2}](./{related-concept-2}.md)**: {How they relate}

## See Also

- [{Related Tutorial}](../tutorials/{page}.md) — learn to use {concept} in practice
- [{Related Reference}](../reference/{page}.md) — full specification
- [{Related How-to}](../how-to/{page}.md) — common tasks involving {concept}
```

## Writing Guidelines

1. **Explain, don't instruct** — this is not a tutorial. "Pipelines process data in stages" not "Run the pipeline with..."
2. **Use diagrams** — concepts are often best understood visually
3. **Build mental models** — help the reader understand why, not just what
4. **Use analogies** — relate unfamiliar concepts to familiar ones
5. **Address misconceptions** — prevent common mistakes through understanding
6. **Link generously** — connect to tutorials (practice), reference (details), and related concepts

## Traceability

| Field | Value |
|-------|-------|
| **Architecture Domain** | {Which domain defines this concept} |
| **Architecture Reference** | {Link to domain ARCHITECTURE.md section} |
| **Glossary Term** | {If this concept has a glossary entry} |
