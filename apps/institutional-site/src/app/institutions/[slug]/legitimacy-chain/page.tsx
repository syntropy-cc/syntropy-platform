/**
 * Institution legitimacy chain — ISR 60s (COMP-036.1).
 */

import { notFound } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

async function getInstitution(slug: string): Promise<{ name: string } | null> {
  const res = await fetch(`${API_URL}/api/v1/public/institutions/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const data = json?.data;
  if (!data) return null;
  return { name: String(data.name ?? "") };
}

export const revalidate = 60;

export default async function InstitutionLegitimacyChainPage({
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
        href={`/institutions/${slug}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← {institution.name}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Legitimacy chain
      </h1>
      <p className="mt-1 text-muted-foreground">
        Governance history (timeline wired when API is available).
      </p>
    </div>
  );
}
