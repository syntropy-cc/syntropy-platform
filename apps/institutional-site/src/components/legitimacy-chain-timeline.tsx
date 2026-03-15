/**
 * LegitimacyChainTimeline — visual timeline of governance decisions (COMP-036.2).
 * Server component; receives items from parent or fetches when API is available.
 */

import type { ReactElement } from "react";

export interface LegitimacyChainItem {
  id: string;
  title: string;
  timestamp: string;
  type?: string;
}

export interface LegitimacyChainTimelineProps {
  items?: LegitimacyChainItem[];
  institutionSlug: string;
}

export function LegitimacyChainTimeline({
  items = [],
  institutionSlug,
}: LegitimacyChainTimelineProps): ReactElement {
  return (
    <section className="rounded-lg border border-border p-4">
      <h2 className="text-lg font-medium text-foreground">Legitimacy chain</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Governance decisions and history
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No entries yet. Timeline will show when{" "}
          <code className="rounded bg-muted px-1">/api/v1/public/institutions/{institutionSlug}/legitimacy-chain</code> is available.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border-l-2 border-primary pl-3">
              <span className="text-sm font-medium text-foreground">{item.title}</span>
              <span className="ml-2 text-xs text-muted-foreground">{item.timestamp}</span>
              {item.type ? (
                <span className="ml-2 text-xs text-muted-foreground">· {item.type}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
