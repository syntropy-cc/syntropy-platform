/**
 * Protected dashboard page — shared user area (COMP-032.2, COMP-032.9).
 * Hosts portfolio, search, recommendations, planning, settings (ADR-012).
 * Middleware redirects to /login if no session.
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Dashboard</h1>
      <p>Signed in as {session.user.email}</p>
      <p>
        <Link href="/logout">Log out</Link>
        {" · "}
        <Link href="/">Home</Link>
      </p>
      <section style={{ marginTop: "2rem" }} aria-label="Shared user area">
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          Cross-pillar features
        </h2>
        <ul style={{ listStyle: "disc", paddingLeft: "1.5rem" }}>
          <li>
            <Link href="/dashboard/portfolio">Portfolio</Link> — XP, achievements,
            skills
          </li>
          <li>
            <Link href="/dashboard/search">Search</Link> — full-text and
            semantic search
          </li>
          <li>
            <Link href="/dashboard/recommendations">Recommendations</Link> —
            personalized content
          </li>
          <li>
            <Link href="/dashboard/planning">Planning</Link> — tasks, goals,
            study plans
          </li>
          <li>
            <Link href="/dashboard/settings">Settings</Link> — preferences and
            profile
          </li>
        </ul>
      </section>
    </main>
  );
}
