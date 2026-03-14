/**
 * Labs article list page (COMP-032.5).
 * GET /labs — list current user's articles (auth).
 */

import Link from "next/link";
import { fetchApi, type ArticleItem } from "../../lib/api";
import { DoiBadge } from "../../components/doi-badge";

async function getDoiForArticle(
  articleId: string,
  token?: string
): Promise<string | null> {
  const result = await fetchApi<{ doi: string }>(
    `/api/v1/labs/articles/${articleId}/doi`,
    token ? { token } : undefined
  );
  if ("error" in result || !result.data?.doi) return null;
  return result.data.doi;
}

export default async function LabsArticleListPage() {
  const result = await fetchApi<ArticleItem[]>("/api/v1/labs/articles");

  if ("error" in result) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Labs</h1>
        <p className="mt-2 text-muted-foreground">
          {result.error.code === "UNAUTHORIZED"
            ? "Sign in to view and manage your articles."
            : result.error.message}
        </p>
      </div>
    );
  }

  const articles = result.data ?? [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Labs</h1>
      <p className="mt-1 text-muted-foreground">
        Scientific publishing and peer review.
      </p>
      <ul className="mt-6 space-y-3">
        {articles.length === 0 ? (
          <li className="rounded-lg border border-border bg-card p-4 text-muted-foreground">
            No articles yet. Create one to get started.
          </li>
        ) : (
          articles.map((article) => (
            <li key={article.id}>
              <Link
                href={`/labs/articles/${article.id}`}
                className="block rounded-lg border border-border bg-card p-4 transition hover:bg-accent/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-foreground">{article.title}</span>
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {article.status}
                  </span>
                </div>
                <ArticleDoiBadge articleId={article.id} />
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

async function ArticleDoiBadge({ articleId }: { articleId: string }) {
  const doi = await getDoiForArticle(articleId);
  if (!doi) return null;
  return (
    <div className="mt-2">
      <DoiBadge doi={doi} />
    </div>
  );
}
