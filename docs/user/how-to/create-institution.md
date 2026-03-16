# How to Create an Institution

> **Goal**: Create a digital institution in the Hub using a governance template so you can add projects and govern them.
>
> **Prerequisites**: Authenticated user; access to the Hub and institution-creation permission.

## Overview

Institutions are created via the Hub (web UI or API). You choose a **contract template** (e.g. Technical Cooperative, Research Laboratory), set name and type, and optionally founding members and visibility. The system creates the institution and records the founding state in the legitimacy chain.

## Steps

### 1. Choose template and parameters

In the Hub UI: click **Create institution**, then select a template. Review what it defines (roles, chambers, voting, right of exit). Set:

- **Name** — institution name (max 200 chars)
- **Type** — `institution` or `laboratory`
- **Contract template ID** — from the template list (or leave default if the UI picks one)
- **Founding members** (if required)

Via API you would call the governance or institutions endpoint with the same data (see [Institutions and Governance API](../reference/api/institutions-governance.md)).

### 2. Confirm creation

Submit the form (or send the API request). The backend creates the institution, attaches the governance contract, and records the initial state in the legitimacy chain.

### 3. Verify

- Open the institution page and confirm the governance contract and legitimacy chain are visible.
- Create a project under the institution to confirm you have the right permissions.

## Result

You have a new digital institution with a governance contract and (optionally) a first project. You can add more projects, create proposals, and manage members according to the contract.

## Variations

**Laboratory**: For Labs, create an institution with type `laboratory`; the same API or UI flow applies, and the laboratory can then host research lines and articles.

**Advanced configuration**: If the UI or API supports “advanced” mode, you can customize chambers, weights, and tier sets instead of using a template as-is.

## Troubleshooting

**400 VALIDATION_ERROR** — Name or type invalid; check length and allowed values.

**403 FORBIDDEN** — You lack permission to create institutions (e.g. role or feature flag).

**422 DOMAIN_ERROR** — Invalid contract template or parameter (e.g. template ID not found or not applicable to the chosen type).

## See Also

- [Institutions and Governance API](../reference/api/institutions-governance.md)
- [Tutorial: Create Institution and Project](../tutorials/03-create-institution-and-project.md)
- [Institutions and Governance](../concepts/institutions-and-governance.md)
