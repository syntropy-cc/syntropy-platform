# How to Submit a Labs Review

> **Goal**: Submit a peer review for a published Labs article, linked to specific passages.
>
> **Prerequisites**: Authenticated user; a **published** article (and optionally the version you are reviewing).

## Overview

In Labs, anyone can review a published article. Reviews are public and can be linked to specific passages. You submit a review via the Labs reviews API (or the article’s review UI); the system may filter visibility by your reputation in the article’s subject area.

## Steps

### 1. Open the article and choose to review

In Labs, open the published article. Use **Add review** or **Review this article** (or the equivalent). Ensure you are reviewing the version you intend (e.g. v1.0); the platform may show the version explicitly.

### 2. Write the review content

Write your review in markdown. Where the UI or API supports it, link comments to specific passages (e.g. by selecting text or by section/line references). You cannot be the article’s author.

### 3. Submit the review

**Via API**:

```bash
curl -X POST "https://api.syntropy.cc/api/v1/labs/articles/{ARTICLE_ID}/reviews" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"## Summary\nYour summary...\n\n## Comments\n..."}'
```

**Via UI**: Use **Submit review** (or equivalent). The review is published and attached to the article version.

### 4. (Optional) Respond to author feedback

If the author responds to your review, you may see it in the thread. You can add a follow-up response if the platform supports it.

## Result

Your review is public and linked to the article (and optionally to passages). It appears in the article’s review list; visibility may be filtered by reputation in the subject area.

## Variations

**Passage-linked comments**: When the editor supports it, select a passage and add a comment; that creates a passage-linked review block. Structure depends on the API/UI.

**Draft then publish**: Some flows let you save a draft review and publish it later; check the article’s review UI.

## Troubleshooting

**401 UNAUTHORIZED** — You must be signed in to submit a review.

**403 FORBIDDEN** — You may not be allowed to review this article (e.g. you are the author, or the article is not yet open for review).

**404 NOT_FOUND** — Article ID wrong or article not published. Use a valid published article ID.

**422 DOMAIN_ERROR** — Invalid body (e.g. empty content) or business rule (e.g. author cannot review own article).

## See Also

- [Labs API](../reference/api/labs.md)
- [Tutorial: Publish a Labs Article](../tutorials/05-publish-labs-article.md)
- [Labs: Research and Review](../concepts/labs-research-and-review.md)
