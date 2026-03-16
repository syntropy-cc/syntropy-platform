# How to Create an Artifact

> **Goal**: Create a DIP artifact (draft), then submit and publish it so it is cryptographically anchored.
>
> **Prerequisites**: Authenticated (Bearer token); basic familiarity with the Artifacts API.

## Overview

Artifacts follow a lifecycle: **draft** → **submitted** → **published**. You create a draft with `POST /api/v1/artifacts`, then call `PUT /api/v1/artifacts/:id/submit` and `PUT /api/v1/artifacts/:id/publish`. Published artifacts receive an identity record (e.g. Nostr-anchored); the content hash and authorship are immutable.

## Steps

### 1. Create a draft artifact

```bash
curl -X POST "https://api.syntropy.cc/api/v1/artifacts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"# My artifact content or code"}'
```

The response is `201 Created` with an artifact object containing `id`, `authorId`, `status: "draft"`, etc. Save the `id`.

### 2. Submit the artifact

```bash
curl -X PUT "https://api.syntropy.cc/api/v1/artifacts/{ARTIFACT_ID}/submit" \
  -H "Authorization: Bearer $TOKEN"
```

The artifact moves to a submitted state (ready for publication).

### 3. Publish the artifact

```bash
curl -X PUT "https://api.syntropy.cc/api/v1/artifacts/{ARTIFACT_ID}/publish" \
  -H "Authorization: Bearer $TOKEN"
```

The server publishes the artifact and anchors it (e.g. to Nostr). The response includes the updated artifact; `publishedAt` and `nostrEventId` (or equivalent) are set when anchoring succeeds.

### 4. (Optional) Poll until anchored

If the response indicates anchoring is asynchronous, poll `GET /api/v1/artifacts/:id` until `nostrEventId` or anchoring status shows anchored. Do not reference the artifact as published in other systems (e.g. contributions) until it is anchored if the API requires it.

## Result

You have a published artifact with a stable ID, content hash, and (when applicable) an immutable identity record. You can use the artifact ID in contributions, project manifests, or portfolio events.

## Variations

**Minimal body**: Some implementations allow `POST /api/v1/artifacts` with an empty body `{}` to create a draft with no content; you might then update content via another endpoint if supported.

**Content-only**: The current API may accept `content` only; for binary or large content, the platform may expect a storage reference (see [Artifacts API](../reference/api/artifacts.md)).

## Troubleshooting

**400 BAD_REQUEST** — Body invalid (e.g. not `{ "content"?: string }`). Send valid JSON.

**403 FORBIDDEN** — You lack permission to create or publish artifacts (e.g. role or scope).

**422 DOMAIN_ERROR** — Lifecycle violation (e.g. publish without submit, or invalid state transition). Follow draft → submit → publish order.

## See Also

- [Artifacts API](../reference/api/artifacts.md)
- [Artifacts and the DIP](../concepts/artifacts-and-dip.md)
- [Quick Start](../getting-started/quick-start.md)
