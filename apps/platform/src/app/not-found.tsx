/**
 * 404 Not Found — user-friendly page with link back (COMP-032.8).
 */

import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "40rem" }}>
      <h1>Page not found</h1>
      <p>The page you’re looking for doesn’t exist or has been moved.</p>
      <p>
        <Link href="/">Home</Link>
        {" · "}
        <Link href="/dashboard">Dashboard</Link>
      </p>
    </main>
  );
}
