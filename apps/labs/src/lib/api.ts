/**
 * API client for Labs app (COMP-032.5).
 * Fetches from platform REST API. Pass token for authenticated endpoints.
 */

const getBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function fetchApi<T>(
  path: string,
  options?: { token?: string }
): Promise<{ data: T } | { error: { code: string; message: string } }> {
  const url = `${getBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }
  const res = await fetch(url, { headers, cache: "no-store" });
  const json = (await res.json()) as
    | { data: T; meta?: unknown }
    | { error: { code: string; message: string }; meta?: unknown };
  if (!res.ok) {
    return {
      error: "error" in json ? json.error : { code: "UNKNOWN", message: res.statusText },
    };
  }
  return "data" in json ? { data: json.data } : { data: undefined as T };
}

export interface ArticleItem {
  id: string;
  title: string;
  content: string;
  subjectAreaId: string;
  authorId: string;
  status: string;
  publishedArtifactId?: string;
  publishedAt?: string;
}

export interface DoiStatus {
  doi: string;
  articleId: string;
  status: string;
  registeredAt: string;
}

export interface ReviewItem {
  id: string;
  articleId: string;
  status: string;
  content?: string;
  submittedAt?: string;
  publishedAt?: string;
}
