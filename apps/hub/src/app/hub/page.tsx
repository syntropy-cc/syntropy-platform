/**
 * Hub discover page — Public Square, institutions ranked by prominence (COMP-032.4).
 */

import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface DiscoverItem {
  institutionId: string;
  name: string;
  prominenceScore: number;
  projectCount: number;
  contributorCount: number;
}

async function getDiscoverList(): Promise<DiscoverItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/hub/discover?limit=50`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function HubDiscoverPage() {
  const items = await getDiscoverList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Discover</h1>
        <p className="text-muted-foreground">
          Institutions ranked by prominence — activity, contributors, and artifacts.
        </p>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground">No institutions yet. Check back later.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item, index) => (
            <li key={item.institutionId} className="py-4 first:pt-0">
              <Link
                href={`/hub/institutions/${item.institutionId}`}
                className="flex items-center justify-between gap-4 hover:opacity-80"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono text-sm w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.contributorCount} contributors · {item.projectCount} projects
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    Prominence: {item.prominenceScore.toFixed(1)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
