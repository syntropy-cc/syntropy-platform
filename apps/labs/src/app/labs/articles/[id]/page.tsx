/**
 * Labs article detail page (COMP-032.5).
 * GET /labs/articles/:id — article with MyST content and DOI badge.
 */

import Link from "next/link";
import { fetchApi, type ArticleItem, type DoiStatus } from "../../../../lib/api";
import { DoiBadge } from "../../../../components/doi-badge";

export default async function LabsArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [articleResult, doiResult] = await Promise.all([
    fetchApi<ArticleItem>(`/api/v1/labs/articles/${id}`),
    fetchApi<DoiStatus>(`/api/v1/labs/articles/${id}/doi`),
  ]);

  if ("error" in articleResult) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Article</h1>
        <p className="mt-2 text-muted-foreground">
          {articleResult.error.code === "NOT_FOUND"
            ? "Article not found."
            : articleResult.error.code === "UNAUTHORIZED"
              ? "Sign in to view this article."
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

  const doi = "data" in doiResult && doiResult.data?.doi ? doiResult.data.doi : null;

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/labs" className="text-sm text-muted-foreground hover:underline">
          ← Labs
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/labs/articles/${id}/edit`} className="text-sm text-primary hover:underline">
          Edit
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/labs/articles/${id}/reviews`} className="text-sm text-primary hover:underline">
          Reviews
        </Link>
      </div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{article.title}</h1>
        <span className="shrink-0 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
          {article.status}
        </span>
      </div>
      {doi && (
        <div className="mb-4">
          <DoiBadge doi={doi} />
        </div>
      )}
      <article className="prose prose-sm dark:prose-invert max-w-none mt-4">
        <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/50 p-4 font-sans text-sm">
          {article.content}
        </pre>
      </article>
      <p className="mt-2 text-xs text-muted-foreground">
        MyST rendering can be added here; content shown as raw for now.
      </p>
    </div>
  );
}
