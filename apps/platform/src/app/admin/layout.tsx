/**
 * Admin layout — role gate for PlatformAdmin / PlatformModerator (COMP-032.6).
 * Architecture: platform/web-application/ARCHITECTURE.md
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api-client";
import Link from "next/link";

const ADMIN_ROLES = ["PlatformAdmin", "PlatformModerator"];

function hasAdminRole(roles: string[]): boolean {
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const me = await fetchApi<{ userId: string; actorId: string; roles: string[] }>("auth/me");
  if (!me.ok || !me.data) {
    redirect("/dashboard");
  }
  if (!hasAdminRole(me.data.roles)) {
    redirect("/forbidden");
  }

  return (
    <main style={{ padding: "1.5rem", fontFamily: "system-ui" }}>
      <nav style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/admin">Admin</Link>
        <Link href="/admin/moderation">Moderation</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/policies">Policies</Link>
        <Link href="/dashboard" style={{ marginLeft: "auto" }}>Dashboard</Link>
      </nav>
      {children}
    </main>
  );
}
