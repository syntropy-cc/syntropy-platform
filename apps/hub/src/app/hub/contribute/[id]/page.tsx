/**
 * Hub contribution flow page (COMP-032.4).
 */

import Link from "next/link";

export default async function HubContributePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link href="/hub" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to Discover
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Contribution</h1>
        <p className="text-muted-foreground">
          Contribution flow for ID: {id}
        </p>
      </div>
      <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
        <p className="mb-4">Contribution editor and merge flow — wired to POST /api/v1/hub/contributions and merge when authenticated.</p>
        <Link
          href={`/hub/contribute/${id}/editor`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Open in editor
        </Link>
      </div>
    </div>
  );
}
