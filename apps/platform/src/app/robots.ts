/**
 * robots.txt for platform (COMP-036.3).
 * Consolidated from institutional-site.
 */

import type { MetadataRoute } from "next";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://syntropy.cc";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_BASE}/sitemap.xml`,
  };
}
