/**
 * GovernanceSummary — governance contract summary, proposal count (COMP-036.2).
 * Consolidated from institutional-site into platform.
 */

import type { ReactElement } from "react";

export interface GovernanceSummaryProps {
  proposalCount: number;
  contractType?: string;
  activeProposals?: number;
}

export function GovernanceSummary({
  proposalCount,
  contractType,
  activeProposals,
}: GovernanceSummaryProps): ReactElement {
  return (
    <section className="rounded-lg border border-border bg-muted/30 p-4">
      <h2 className="text-lg font-medium text-foreground">Governance</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {contractType ? `Contract: ${contractType}` : "Governance contract summary"}
      </p>
      <p className="mt-2 text-foreground">
        <span className="font-medium">{proposalCount}</span> proposal
        {proposalCount !== 1 ? "s" : ""} total
        {activeProposals != null ? (
          <> · <span className="font-medium">{activeProposals}</span> active</>
        ) : null}
      </p>
    </section>
  );
}
