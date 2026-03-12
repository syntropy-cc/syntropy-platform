# Pillar Agents — Subdomain Architecture

> **Document Type**: Subdomain Architecture Document (Level 3 - Component)
> **Parent Domain**: [AI Agents](../ARCHITECTURE.md)
> **Root Architecture**: [System Architecture](../../../ARCHITECTURE.md)
> **Last Updated**: 2026-03-12
> **Subdomain Owner**: Syntropy Core Team

## Metadata

| Field | Value |
|-------|-------|
| **Subdomain Type** | Supporting Subdomain |
| **Parent Domain** | AI Agents |
| **Boundary Model** | Internal Module (within AI Agents domain) |
| **Implementation Status** | Not Started |

---

## Business Scope

### What This Subdomain Solves

Pillar Agents documents the catalog of specialized AI agents available in each pillar. Each agent has a specific task scope, tool set, and activation context. Without specialized agents, users would interact with a generic LLM with no platform context — which is precisely what the ecosystem aims to avoid.

### Subdomain Classification Rationale

**Type**: Supporting Subdomain. Pillar agents are specializations of the orchestration infrastructure. They are defined via AIAgent definitions in the registry; the implementation is in their system prompts and tool configurations, not in complex domain logic.

---

## Agent Catalog

### Learn Agents (5)

| Agent | Activation Context | Primary Responsibility | Key Tools |
|-------|-------------------|-----------------------|-----------|
| **Project Scoping Agent** | Track creation (status: Draft) | Helps creator define the project a track will build; produces scoped artifact specification | `learn.get_track_context`, `dip.search_projects` |
| **Curriculum Architect Agent** | Track creation (status: ProjectDefined) | Designs the course structure and fragment sequence for the track based on the artifact specification | `learn.create_course_structure`, `learn.list_fragment_templates` |
| **Fragment Author Agent** | Fragment editing (status: Draft, section: Theory/Artifact) | Generates draft Theory and Artifact content for a fragment; creator reviews and approves | `learn.get_fragment_context`, `learn.save_fragment_draft` |
| **Pedagogical Validator Agent** | Fragment editing (status: Draft, before publish) | Evaluates whether the Fragment meets pedagogical quality standards; provides specific improvement feedback | `learn.get_fragment_content`, `learn.submit_validation_report` |
| **Iteration Agent** | Fragment editing (after validation feedback) | Refines fragment content based on validation feedback; proposes specific edits | `learn.get_validation_feedback`, `learn.save_fragment_draft` |

### Hub Agents (3)

| Agent | Activation Context | Primary Responsibility | Key Tools |
|-------|-------------------|-----------------------|-----------|
| **Artifact Copilot Agent** | Contribution editing (status: Draft) | Assists contributors in refining contribution code/content; suggests improvements; helps with issue acceptance criteria | `hub.get_issue_context`, `hub.get_contribution_draft`, `ide.get_workspace_context` |
| **Institution Setup Agent** | Institution creation workflow | Guides institution admin through ContractTemplate selection and governance parameter configuration | `hub.list_contract_templates`, `hub.get_dip_governance_preview` |
| **Contribution Reviewer Agent** | Contribution review (status: InReview, assigned to reviewer) | Assists reviewer in evaluating contributions against acceptance criteria; generates structured review checklist | `hub.get_contribution_content`, `hub.get_issue_acceptance_criteria` |

### Labs Agents (3)

| Agent | Activation Context | Primary Responsibility | Key Tools |
|-------|-------------------|-----------------------|-----------|
| **Literature Review Agent** | Article creation (initial phase) | Discovers related work in Platform Core search index and external databases; produces structured literature review notes | `labs.search_articles`, `labs.search_external_databases`, `platform_core.search` |
| **Research Structuring Agent** | Article creation (outline phase) | Helps researcher structure the article sections (Introduction, Methods, Results, Discussion); proposes hypothesis records | `labs.create_article_outline`, `labs.create_hypothesis_record` |
| **Article Drafting Agent** | Article editing (content phase) | Generates MyST+LaTeX draft content for specific article sections; respects the researcher's existing content | `labs.get_article_section`, `labs.save_article_draft`, `labs.list_embedded_artifacts` |

### Cross-Pillar Navigation Agent (1)

| Agent | Activation Context | Primary Responsibility | Key Tools |
|-------|-------------------|-----------------------|-----------|
| **Cross-Pillar Navigation Agent** | Portfolio view, Dashboard, any pillar | Surfaces cross-pillar opportunities; explains connections between a user's work in different pillars; guides discovery | `platform_core.get_recommendations`, `platform_core.search`, `learn.get_relevant_tracks`, `hub.get_open_issues`, `labs.get_relevant_articles` |

---

## Traceability

| Vision Element | Section | How This Subdomain Implements It |
|----------------|---------|----------------------------------|
| AI Copilot for learners and creators (cap. 12) | §23, §24 | 5 Learn agents covering the full creation lifecycle |
| AI Copilot for Hub contributors (cap. 12) | §28 | 3 Hub agents |
| AI Copilot for researchers (cap. 12) | §36 | 3 Labs agents |
| Cross-pillar navigation (cap. 3, 12) | §2 | Cross-Pillar Navigation Agent using unified UserContextModel |
