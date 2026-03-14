/**
 * Learn career list page (COMP-032.3).
 * GET /learn — list careers from API.
 */

import Link from "next/link";
import { fetchApi, type CareerItem } from "../../lib/api";

export default async function LearnCareersPage() {
  const result = await fetchApi<CareerItem[]>("/api/v1/learn/careers");

  if ("error" in result) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Learn</h1>
        <p className="mt-2 text-muted-foreground">
          {result.error.code === "UNAUTHORIZED"
            ? "Sign in to view learning paths."
            : result.error.message}
        </p>
      </div>
    );
  }

  const careers = result.data ?? [];

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/learn" className="text-sm text-muted-foreground hover:underline">
          ← Learn
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Learning paths</h1>
      <p className="mt-1 text-muted-foreground">
        Choose a career to see tracks and courses.
      </p>
      <ul className="mt-6 space-y-3">
        {careers.map((career) => (
          <li key={career.id}>
            <Link
              href={`/learn/careers/${career.id}`}
              className="block rounded-lg border border-border bg-card p-4 transition hover:bg-accent/50"
            >
              <span className="font-medium text-foreground">{career.title}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {career.trackIds.length} track(s)
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {careers.length === 0 && (
        <p className="mt-6 text-muted-foreground">No careers yet.</p>
      )}
    </div>
  );
}
