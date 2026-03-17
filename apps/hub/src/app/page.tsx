/**
 * Hub app home — redirect to discover (COMP-032.4).
 */

import Link from "next/link";
import { Button } from "@syntropy/ui";

export default function HubPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Hub</h1>
      <p className="text-muted-foreground">Collaboration and projects.</p>
      <Button asChild variant="primary">
        <Link href="/hub">Discover institutions</Link>
      </Button>
    </div>
  );
}
