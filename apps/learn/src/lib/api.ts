/**
 * API client for Learn app (COMP-032.3).
 * Fetches from platform REST API. Auth token should be passed when available.
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

export interface CareerItem {
  id: string;
  title: string;
  trackIds: string[];
}

export interface TrackWithVisibility {
  id: string;
  careerId: string;
  title: string;
  courseIds: string[];
  unlocked: Array<{ courseId: string; title: string; orderPosition: number }>;
  locked: Array<{
    courseId: string;
    title: string;
    orderPosition: number;
    reason: string;
  }>;
}

export interface CourseItem {
  id: string;
  trackId: string;
  title: string;
  orderPosition: number;
  fragmentIds: string[];
  status: string;
}

export interface FragmentItem {
  id: string;
  courseId: string;
  creatorId: string;
  title: string;
  status: string;
  problemContent: string;
  theoryContent: string;
  artifactContent: string;
  publishedArtifactId: string | null;
}
