/**
 * ProjectGrid — institution DIP projects with artifact count (COMP-036.2).
 * Server component; receives projects from parent or fetches when API is available.
 */

import type { ReactElement } from "react";

export interface ProjectItem {
  id: string;
  name: string;
  slug?: string;
  artifactCount?: number;
}

export interface ProjectGridProps {
  projects?: ProjectItem[];
  institutionSlug: string;
}

export function ProjectGrid({
  projects = [],
  institutionSlug,
}: ProjectGridProps): ReactElement {
  return (
    <section className="rounded-lg border border-border p-4">
      <h2 className="text-lg font-medium text-foreground">Projects</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        DIP projects under this institution
      </p>
      {projects.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No projects listed yet. Grid will populate when{" "}
          <code className="rounded bg-muted px-1">/api/v1/public/institutions/{institutionSlug}/projects</code> is available.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <li
              key={p.id}
              className="rounded-md border border-border bg-muted/20 p-3"
            >
              <span className="font-medium text-foreground">{p.name}</span>
              {p.artifactCount != null ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.artifactCount} artifact{p.artifactCount !== 1 ? "s" : ""}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
