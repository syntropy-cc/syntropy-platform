/**
 * Learn fragment view — Problem / Theory / Artifact sections + progress (COMP-032.3).
 * GET /learn/fragments/:id
 */

import Link from "next/link";
import { fetchApi, type FragmentItem } from "../../../../lib/api";

export default async function LearnFragmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: fragmentId } = await params;
  const result = await fetchApi<FragmentItem>(
    `/api/v1/learn/fragments/${fragmentId}`
  );

  if ("error" in result) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Fragment</h1>
        <p className="mt-2 text-muted-foreground">
          {result.error.code === "NOT_FOUND"
            ? "Fragment not found."
            : result.error.message}
        </p>
      </div>
    );
  }

  const fragment = result.data;
  if (!fragment) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Fragment not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/learn" className="text-sm text-muted-foreground hover:underline">
          ← Back to paths
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">{fragment.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Status: {fragment.status}
        {fragment.publishedArtifactId && (
          <span> · Published artifact: {fragment.publishedArtifactId}</span>
        )}
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-1">
        <section>
          <h2 className="text-lg font-medium text-foreground">Problem</h2>
          <div className="mt-2 rounded border border-border bg-muted/20 p-4 text-foreground whitespace-pre-wrap">
            {fragment.problemContent || "—"}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground">Theory</h2>
          <div className="mt-2 rounded border border-border bg-muted/20 p-4 text-foreground whitespace-pre-wrap">
            {fragment.theoryContent || "—"}
          </div>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground">Artifact</h2>
          <div className="mt-2 rounded border border-border bg-muted/20 p-4 font-mono text-sm text-foreground whitespace-pre-wrap">
            {fragment.artifactContent || "—"}
          </div>
        </section>
      </div>
      {fragment.status === "published" && (
        <p className="mt-6 text-sm text-muted-foreground">
          Mark as complete from the course page when you finish this fragment.
        </p>
      )}
    </div>
  );
}
