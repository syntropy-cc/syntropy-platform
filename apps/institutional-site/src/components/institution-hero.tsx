/**
 * InstitutionHero — name, type, description, member count, creation (COMP-036.2).
 * Server component; receives data from parent fetch.
 * Above-the-fold images must use next/image with priority (COMP-036.4, LCP).
 */

import type { ReactElement } from "react";

export interface InstitutionHeroProps {
  name: string;
  institutionId: string;
  status: string;
  /** Optional: when API provides type/description/memberCount/createdAt */
  type?: string;
  description?: string;
  memberCount?: number;
  createdAt?: string;
}

export function InstitutionHero({
  name,
  institutionId,
  status,
  type,
  description,
  memberCount,
  createdAt,
}: InstitutionHeroProps): ReactElement {
  return (
    <header className="border-b border-border pb-6">
      <h1 className="text-3xl font-semibold text-foreground">{name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {institutionId}
        {type ? ` · ${type}` : ""}
        {status ? ` · ${status}` : ""}
      </p>
      {description ? (
        <p className="mt-3 text-foreground">{description}</p>
      ) : null}
      {(memberCount != null || createdAt) ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {memberCount != null ? `${memberCount} members` : ""}
          {memberCount != null && createdAt ? " · " : ""}
          {createdAt ? `Created ${createdAt}` : ""}
        </p>
      ) : null}
    </header>
  );
}
