/**
 * Institutions directory (COMP-036.1).
 */

import Link from "next/link";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

async function getSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/public/institutions`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const slugs = json?.data?.slugs ?? [];
    return Array.isArray(slugs) ? slugs : [];
  } catch {
    return [];
  }
}

export const revalidate = 60;

export default async function InstitutionsPage() {
  const slugs = await getSlugs();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Institutions
      </h1>
      {slugs.length === 0 ? (
        <p className="mt-2 text-muted-foreground">
          No institutions yet. Pre-rendered institution pages are available at{" "}
          <code className="rounded bg-muted px-1">/institutions/[slug]</code>.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {slugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/institutions/${slug}`}
                className="text-primary hover:underline"
              >
                {slug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
