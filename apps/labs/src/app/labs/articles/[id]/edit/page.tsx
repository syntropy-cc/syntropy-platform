/**
 * Labs article edit page (COMP-032.5, COMP-035.1).
 * GET /labs/articles/:id/edit — editor for article (auth; author only).
 */

import Link from "next/link";
import { fetchApi, type ArticleItem } from "../../../../../lib/api";
import { ArticleEditorClient } from "./article-editor-client";

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
      <div className="mt-4">
        <ArticleEditorClient
          articleId={id}
          title={article.title}
          initialContent={article.content ?? ""}
        />
      </div>
    </div>
  );
}
