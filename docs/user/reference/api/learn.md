# Learn API

Learn domain: tracks, courses, fragments, enrollment. Used by the Learn pillar and by clients that need to list or consume learning content.

## Endpoint prefixes

| Prefix | Description |
|--------|-------------|
| `/api/v1/learn/tracks` or `/api/v1/tracks` | List/get tracks |
| `/api/v1/learn/fragments` or `/api/v1/fragments` | Get fragment content |
| `/api/v1/learn/enroll` or `/api/v1/tracks/:id/enroll` | Enroll user in track |

(Exact paths depend on implementation; check OpenAPI spec.)

## List tracks

```
GET /api/v1/tracks
```

**Query**: `career_id`, `page`, `per_page`. Often public (no auth) for published tracks.

**Response** `200 OK` — Paginated list of track summaries (id, title, careerId, referenceProjectId, status).

**Errors**: 400, 429, 503.

## Get fragment

```
GET /api/v1/fragments/:id
```

**Response** `200 OK` — Fragment with `problem`, `theory`, `artifact_prompt`, and metadata. Access may be gated by enrollment or fog-of-war rules (403 if not unlocked).

**Errors**: 401, 403, 404, 503.

## Enroll in track

```
POST /api/v1/tracks/:trackId/enroll
```

**Response** `201 Created` — Enrollment record (enrollment_id, track_id, user_id, enrolled_at).

**Errors**: 401, 404, 409 (already enrolled), 503.

## See Also

- [Learn: Tracks and Fragments](../../concepts/learn-track-fragment.md)
- [Tutorial: Complete a Learn Track](../../tutorials/02-complete-learn-track.md)
- [API Overview](overview.md)
