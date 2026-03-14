/**
 * Hub institution detail page (COMP-032.4).
 */

import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getInstitution(id: string) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/hub/institutions/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function HubInstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const institution = await getInstitution(id);

  if (!institution) {
    return (
      <div className="space-y-4">
        <Link href="/hub" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Discover
        </Link>
        <p className="text-muted-foreground">Institution not found.</p>
      </div>
    );
  }

  const name = institution.name ?? "Institution";
  const institutionType = institution.institutionType ?? "—";

  return (
    <div className="space-y-6">
      <Link href="/hub" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to Discover
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
        <p className="text-muted-foreground">Type: {institutionType}</p>
      </div>
      <div className="rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Institution profile and projects — full detail view coming soon.
        </p>
      </div>
    </div>
  );
}
