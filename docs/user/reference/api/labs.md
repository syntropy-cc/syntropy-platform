# Labs API

Labs domain: articles, reviews, DOI, experiments, and scientific context (research lines, laboratories, subject areas). Laboratories are institutions of type `laboratory`; research lines are projects of type `research-line`.

## Endpoint groups

| Prefix | Description |
|--------|-------------|
| `/api/v1/labs/articles` | Create, get, update draft; submit; get versions |
| `/api/v1/labs/articles/:id/reviews` | List/create reviews for an article |
| `/api/v1/labs/reviews/:id/responses` | Author response to a review |
| `/api/v1/labs/doi` | DOI registration status or trigger (if exposed) |
| `/api/v1/labs/experiments` | Experiment lifecycle (if exposed) |
| `/api/v1/labs/scientific-context` | Research lines, subject areas, hypotheses (if exposed) |

## Articles

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/labs/articles` | Create draft article (title, etc.) |
| GET | `/api/v1/labs/articles/:id` | Get article |
| PUT | `/api/v1/labs/articles/:id` | Update draft (e.g. myst_source) |
| POST | `/api/v1/labs/articles/:id/submit` | Submit for publication |
| GET | `/api/v1/labs/articles/:id/versions` | List versions |

**Request (create)**: `title`, optional `myst_source`. **Request (update)**: `myst_source`, optional `human_approved` (required true before publish for AI-assisted content).

**Response (create)** `201 Created` — Article with `id`, `status: "draft"`. **Response (submit)** `200` or `202` — Article with `status: "published"`, `current_version`, `doi_registration_status` if applicable.

**Errors**: 400, 401, 403, 404, 422 (e.g. human_approved false, already published), 409, 503.

## Reviews

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/labs/articles/:id/reviews` | Create review (content, optional passage refs) |
| GET | `/api/v1/labs/articles/:id/reviews` | List reviews for article |
| POST | `/api/v1/labs/reviews/:id/responses` | Author response to review |

**Request (create review)**: `content` (markdown). Reviewer must not be the article author.

**Response (create)** `201 Created` — Review with `id`, `article_id`, `reviewer_id`, `status`, `content`.

**Errors**: 401, 403, 404, 422 (e.g. author cannot review own article), 503.

## See Also

- [Labs: Research and Review](../../concepts/labs-research-and-review.md)
- [How to submit a Labs review](../../how-to/submit-review-labs.md)
- [Tutorial: Publish a Labs Article](../../tutorials/05-publish-labs-article.md)
- [API Overview](overview.md)
