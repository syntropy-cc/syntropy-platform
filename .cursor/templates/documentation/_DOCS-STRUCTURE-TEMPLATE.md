# User Documentation Structure Template

> Use this template to scaffold the top-level `docs/user/` directory for a new project. Adapt sections based on the system type detected from `ARCHITECTURE.md` (see DOC-002).

## Required Directory Layout

```
docs/
├── user/
│   ├── index.md                        # Landing page
│   ├── getting-started/
│   │   ├── installation.md             # Installation / setup
│   │   └── quick-start.md             # First working interaction
│   ├── tutorials/
│   │   └── {workflow-name}.md          # One per primary user workflow
│   ├── how-to/
│   │   └── {task-name}.md             # One per common task
│   ├── reference/
│   │   ├── api/                        # [If API] Endpoint reference
│   │   │   └── {resource}.md
│   │   ├── cli/                        # [If CLI] Command reference
│   │   │   └── {command-group}.md
│   │   └── configuration.md            # Configuration options
│   ├── concepts/
│   │   └── {concept-name}.md           # Key domain concepts
│   ├── faq.md                          # Frequently asked questions
│   ├── glossary.md                     # Term definitions
│   └── changelog.md                    # User-facing version history
└── mkdocs.yml                          # Portal configuration (use _MKDOCS-TEMPLATE.yml)
```

## Landing Page (index.md)

```markdown
# {System Name}

{One-sentence description of what the system does and who it is for.}

## What is {System Name}?

{2-3 paragraphs explaining the system's purpose, key capabilities, and value proposition. Write for your target audience — not for developers who built it.}

## Key Features

- **{Feature 1}**: {Brief description}
- **{Feature 2}**: {Brief description}
- **{Feature 3}**: {Brief description}

## Quick Links

| I want to... | Go to |
|---------------|-------|
| Install and get started | [Getting Started](getting-started/installation.md) |
| Follow a step-by-step tutorial | [Tutorials](tutorials/) |
| Look up a specific command/endpoint | [Reference](reference/) |
| Understand a concept | [Concepts](concepts/) |
| Find answers to common questions | [FAQ](faq.md) |

## Current Version

**{System Name} v{X.Y.Z}** — [Changelog](changelog.md)
```

## System-Type Sections

### For API Systems

Add under `reference/api/`:
- One file per resource (e.g., `users.md`, `orders.md`, `pipelines.md`)
- An `overview.md` with authentication, base URL, error format, rate limits
- Use `_REFERENCE-API-TEMPLATE.md` for each resource file

### For CLI Systems

Add under `reference/cli/`:
- One file per command group (e.g., `pipeline-commands.md`, `config-commands.md`)
- A `global-options.md` for flags shared across all commands
- Use `_REFERENCE-CLI-TEMPLATE.md` for each command group file

### For Web Applications

Add under `reference/`:
- One file per feature area (e.g., `dashboard.md`, `settings.md`)
- Include screenshots or annotated UI mockups
- A `keyboard-shortcuts.md` if applicable

### For Libraries/SDKs

Add under `reference/`:
- One file per module/namespace
- Generated from docstrings where possible (mkdocstrings for Python, TypeDoc for TS)
- A `types.md` for shared type definitions

### For Agent/Pipeline Systems

Add under `reference/`:
- One file per agent type or pipeline step
- A `configuration.md` with all YAML/JSON configuration options
- An `input-output.md` describing data formats

## Traceability

Every documentation page should trace back to its source:

| Page Type | Traces To |
|-----------|-----------|
| Tutorial | Vision capability or user workflow |
| How-to guide | Vision capability or common task |
| Reference (API/CLI) | Architecture component or API spec |
| Concept | Domain concept in architecture |
| FAQ | Common issues from implementation/testing |
