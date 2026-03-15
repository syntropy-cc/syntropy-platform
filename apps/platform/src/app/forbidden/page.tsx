/**
 * 403 Forbidden — shown when user lacks required role (e.g. admin) (COMP-032.6/032.8).
 */

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "40rem" }}>
      <h1>Access denied</h1>
      <p>You don&apos;t have permission to view this page.</p>
      <p>
        <Link href="/dashboard">Back to dashboard</Link>
        {" · "}
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}
