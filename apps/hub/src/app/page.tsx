/**
 * Hub app home — redirect to discover (COMP-032.4).
 */

import Link from "next/link";

export default function HubPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Hub</h1>
      <p className="text-muted-foreground">Collaboration and projects.</p>
      <Link
        href="/hub"
        className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Discover institutions
      </Link>
    </div>
  );
}
