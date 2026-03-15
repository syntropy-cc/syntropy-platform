/**
 * Institutional Site home (COMP-036.1).
 */

import Link from "next/link";

export default function InstitutionalSiteHome() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-foreground">
        Digital Institutions
      </h1>
      <p className="mt-2 text-muted-foreground">
        Public profiles for institutions on the Syntropy Platform.
      </p>
      <Link
        href="/institutions"
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Browse institutions
      </Link>
    </div>
  );
}
