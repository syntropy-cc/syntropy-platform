/**
 * Landing page stub (COMP-032.2). M1 verification: http://localhost:3000 loads.
 */

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Welcome to Syntropy Platform</h1>
      <p>
        <Link href="/login">Log in</Link>
        {" · "}
        <Link href="/dashboard">Dashboard</Link> (protected)
      </p>
    </main>
  );
}
