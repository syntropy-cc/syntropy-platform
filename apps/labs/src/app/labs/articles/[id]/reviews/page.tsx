/**
 * Labs article reviews page (COMP-032.5).
 * GET /labs/articles/:id/reviews — peer review panel.
 */

import Link from "next/link";
import { fetchApi, type ArticleItem, type ReviewItem } from "../../../../../lib/api";

export default async function LabsArticleReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [articleResult, reviewsResult] = await Promise.all([
    fetchApi<ArticleItem>(`/api/v1/labs/articles/${id}`),
    fetchApi<ReviewItem[]>(`/api/v1/labs/articles/${id}/reviews`),
  ]);

  if ("error" in articleResult) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
        <p className="mt-2 text-muted-foreground">
          {articleResult.error.code === "NOT_FOUND"
            ? "Article not found."
            : articleResult.error.code === "UNAUTHORIZED"
              ? "Sign in to view reviews."
              : articleResult.error.message}
        </p>
        <Link href="/labs" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to Labs
        </Link>
      </div>
    );
  }

  const article = articleResult.data;
  if (!article) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Article not found.</p>
        <Link href="/labs" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to Labs
        </Link>
      </div>
    );
  }

  const reviews =
    "data" in reviewsResult && Array.isArray(reviewsResult.data) ? reviewsResult.data : [];

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href={`/labs/articles/${id}`} className="text-sm text-muted-foreground hover:underline">
          ← {article.title}
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Peer review</h1>
      <p className="mt-1 text-muted-foreground">
        Reviews for this article. Visibility depends on embargo and publication status.
      </p>
      <ul className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <li className="rounded-lg border border-border bg-card p-4 text-muted-foreground">
            No reviews yet.
          </li>
        ) : (
          reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-muted-foreground">{review.id}</span>
                <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {review.status}
                </span>
              </div>
              {review.content != null && (
                <p className="mt-2 text-sm text-foreground">{review.content}</p>
              )}
              {review.submittedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted: {new Date(review.submittedAt).toLocaleString()}
                </p>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
