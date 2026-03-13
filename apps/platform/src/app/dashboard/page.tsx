/**
 * Protected dashboard page — only reachable when authenticated (COMP-032.2).
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
    </main>
  );
}
