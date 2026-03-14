/**
 * Learn track list for a career — fog-of-war UI (COMP-032.3).
 * GET /learn/careers/:careerId — tracks with unlocked/locked courses.
 */

import Link from "next/link";
import { fetchApi, type TrackWithVisibility } from "../../../../lib/api";

export default async function LearnCareerTracksPage({
  params,
}: {
  params: Promise<{ careerId: string }>;
}) {
  const { careerId } = await params;
  const result = await fetchApi<TrackWithVisibility[]>(
    `/api/v1/learn/careers/${careerId}/tracks`
  );

  if ("error" in result) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-foreground">Tracks</h1>
        <p className="mt-2 text-muted-foreground">
          {result.error.code === "UNAUTHORIZED"
            ? "Sign in to view tracks."
            : result.error.message}
        </p>
      </div>
    );
  }

  const tracks = result.data ?? [];

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/learn" className="text-sm text-muted-foreground hover:underline">
          ← Learning paths
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Tracks</h1>
      <p className="mt-1 text-muted-foreground">
        Unlocked courses depend on your progress.
      </p>
      <div className="mt-6 space-y-8">
        {tracks.map((track) => (
          <section key={track.id}>
            <h2 className="text-lg font-medium text-foreground">{track.title}</h2>
            <div className="mt-3 space-y-2">
              {track.unlocked.map((c) => (
                <Link
                  key={c.courseId}
                  href={`/learn/courses/${c.courseId}`}
                  className="block rounded border border-border bg-card p-3 text-foreground transition hover:bg-accent/50"
                >
                  <span className="font-medium">{c.title}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Unlocked
                  </span>
                </Link>
              ))}
              {track.locked.map((c) => (
                <div
                  key={c.courseId}
                  className="block rounded border border-border bg-muted/30 p-3 text-muted-foreground"
                >
                  <span className="font-medium">{c.title}</span>
                  <span className="ml-2 text-sm">Locked — {c.reason}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {tracks.length === 0 && (
        <p className="mt-6 text-muted-foreground">No tracks in this career.</p>
      )}
    </div>
  );
}
