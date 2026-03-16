/**
 * ContributorHighlights — top contributors (COMP-036.2).
 * Consolidated from institutional-site into platform.
 */

import type { ReactElement } from "react";

export interface ContributorItem {
  id: string;
  displayName: string;
  portfolioUrl?: string;
  contributionCount?: number;
}

export interface ContributorHighlightsProps {
  contributors?: ContributorItem[];
  institutionSlug: string;
}

export function ContributorHighlights({
  contributors = [],
  institutionSlug,
}: ContributorHighlightsProps): ReactElement {
  return (
    <section className="rounded-lg border border-border p-4">
      <h2 className="text-lg font-medium text-foreground">Contributors</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Top contributors to this institution
      </p>
      {contributors.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No contributor data yet. Highlights will show when portfolio/contributor API is wired for{" "}
          <code className="rounded bg-muted px-1">/institutions/{institutionSlug}</code>.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {contributors.map((c) => (
            <li key={c.id}>
              {c.portfolioUrl ? (
                <a
                  href={c.portfolioUrl}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {c.displayName}
                </a>
              ) : (
                <span className="text-foreground">{c.displayName}</span>
              )}
              {c.contributionCount != null ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  · {c.contributionCount} contribution{c.contributionCount !== 1 ? "s" : ""}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
