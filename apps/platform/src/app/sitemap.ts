/**
 * Dynamic sitemap for platform (COMP-036.3).
 * Institutions and home; consolidated from institutional-site.
 */

import type { MetadataRoute } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:8080";
const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://syntropy.cc";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs: string[] = [];
  try {
    const res = await fetch(`${API_URL}/api/v1/public/institutions`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      const list = json?.data?.slugs ?? [];
      if (Array.isArray(list)) slugs.push(...list);
    }
  } catch {
    // Return at least base URL on failure
  }

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_BASE, lastModified: now },
    { url: `${SITE_BASE}/institutions`, lastModified: now },
    ...slugs.map((slug) => ({
      url: `${SITE_BASE}/institutions/${slug}`,
      lastModified: now,
    })),
  ];
  return entries;
}
