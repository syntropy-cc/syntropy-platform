/**
 * Institution profile page — ISR 60s (COMP-036.1, COMP-036.2).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { InstitutionHero } from "@/components/institution-hero";
import { GovernanceSummary } from "@/components/governance-summary";
import { LegitimacyChainTimeline } from "@/components/legitimacy-chain-timeline";
import { ProjectGrid } from "@/components/project-grid";
import { ContributorHighlights } from "@/components/contributor-highlights";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

interface PublicInstitution {
  institutionId: string;
  name: string;
  status: string;
  proposalCount: number;
}

async function getInstitution(slug: string): Promise<PublicInstitution | null> {
  const res = await fetch(`${API_URL}/api/v1/public/institutions/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const data = json?.data;
  if (!data || typeof data.institutionId !== "string") return null;
  return data as PublicInstitution;
}

export const revalidate = 60;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/public/institutions`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const slugs = json?.data?.slugs ?? [];
    return Array.isArray(slugs)
      ? (slugs as string[]).slice(0, 100).map((slug) => ({ slug }))
      : [];
  } catch {
    return [];
  }
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = await getInstitution(slug);
  if (!institution) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/institutions"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Institutions
      </Link>
      <div className="mt-4 space-y-8">
        <InstitutionHero
          name={institution.name}
          institutionId={institution.institutionId}
          status={institution.status}
        />
        <GovernanceSummary proposalCount={institution.proposalCount} />
        <LegitimacyChainTimeline institutionSlug={slug} />
        <ProjectGrid institutionSlug={slug} />
        <ContributorHighlights institutionSlug={slug} />
      </div>
    </div>
  );
}
