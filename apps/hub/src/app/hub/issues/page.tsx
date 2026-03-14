/**
 * Hub issues board page (COMP-032.4).
 */

import Link from "next/link";

export default function HubIssuesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Issues</h1>
        <p className="text-muted-foreground">
          Browse and manage project issues. Requires authentication.
        </p>
      </div>
      <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
        <p>Issue board — list and filters will load from GET /api/v1/hub/issues when authenticated.</p>
        <p className="mt-2 text-sm">
          <Link href="/hub" className="hover:text-foreground">Back to Discover</Link>
        </p>
      </div>
    </div>
  );
}
