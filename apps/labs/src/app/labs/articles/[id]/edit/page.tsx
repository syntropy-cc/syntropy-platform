/**
 * Labs article edit page (COMP-032.5).
 * GET /labs/articles/:id/edit — editor for article (auth; author only).
 */

import Link from "next/link";
import { fetchApi, type ArticleItem } from "../../../../../lib/api";

export default async function LabsArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchApi<ArticleItem>(`/api/v1/labs/articles/${id}`);

  if ("error" in result) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Edit article</h1>
        <p className="mt-2 text-muted-foreground">
          {result.error.code === "NOT_FOUND"
            ? "Article not found."
            : result.error.code === "UNAUTHORIZED"
              ? "Sign in to edit articles."
              : result.error.message}
        </p>
        <Link href="/labs" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Back to Labs
        </Link>
      </div>
    );
  }

  const article = result.data;
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

  if (article.status !== "draft") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Edit article</h1>
        <p className="mt-2 text-muted-foreground">
          Only draft articles can be edited here. This article is {article.status}.
        </p>
        <Link href={`/labs/articles/${id}`} className="mt-4 inline-block text-sm text-primary hover:underline">
          ← View article
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href={`/labs/articles/${id}`} className="text-sm text-muted-foreground hover:underline">
          ← {article.title}
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Edit article</h1>
      <p className="mt-1 text-muted-foreground">
        Use the API (PUT /api/v1/labs/articles/{id}) to update title and content. In-app editor coming soon.
      </p>
      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground">{article.title}</p>
        <pre className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {article.content}
        </pre>
      </div>
    </div>
  );
}
