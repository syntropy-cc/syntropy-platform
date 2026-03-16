# How to Submit a Contribution

> **Goal**: Submit an artifact as a contribution to a Hub issue so a maintainer can review and accept it.
>
> **Prerequisites**: Authenticated user; a **published** artifact; an **open** issue in a Hub project you can contribute to.

## Overview

A **Contribution** links an artifact to an issue. You create it by calling the Hub contribution endpoint (or using the Hub UI) with the issue ID and artifact ID. The artifact must be published (and anchored if the platform requires it); the issue must be open.

## Steps

### 1. Ensure the artifact is published

Your artifact must be in `published` state. If you created it via the API, complete the draft → submit → publish flow (see [Create an artifact](create-artifact.md)). If you built it in the IDE, use the “Publish” or “Submit” action in the UI so the platform has a DIP artifact ID.

### 2. Get the issue ID

From the Hub, open the issue you want to contribute to and note its ID (from the URL or the issue details). The project must allow contributions and the issue must be **open**.

### 3. Submit the contribution

**Via API** (if the endpoint is exposed):

```bash
curl -X POST "https://api.syntropy.cc/api/v1/issues/{ISSUE_ID}/contributions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"artifact_id":"<PUBLISHED_ARTIFACT_UUID>"}'
```

**Via UI**: On the issue page, use **Submit contribution** (or **Contribute**), select or attach the artifact you produced (e.g. from the IDE or from your artifacts), and submit.

### 4. Wait for review

The contribution appears as “submitted” or “in review”. The project maintainer can accept or reject it and leave feedback. If they request changes, you may update the artifact and resubmit or add a new contribution as the workflow allows.

## Result

The issue has a contribution linked to your artifact. When the maintainer accepts it, the contribution is integrated (per project rules) and your portfolio is updated.

## Variations

**Contribution Sandbox**: Some flows create a sandbox (Hackin dimension) first; you work there and then promote or submit the resulting artifact as the contribution.

**Multiple contributions**: You can usually submit more than one contribution per issue (e.g. revised versions); check the UI or API for “replace” vs “add new” behavior.

## Troubleshooting

**409 CONFLICT** — The issue is closed; you cannot add new contributions. Pick an open issue.

**422 DOMAIN_ERROR** — The artifact is not published or not anchored. Publish the artifact first and (if required) wait until anchoring completes.

**403 FORBIDDEN** — You lack permission to contribute to this project (e.g. private project, or you are not a member/contributor).

## See Also

- [Hub API](../reference/api/hub.md)
- [Tutorial: Contribute to a Hub Project](../tutorials/04-contribute-to-hub-project.md)
- [Create an artifact](create-artifact.md)
