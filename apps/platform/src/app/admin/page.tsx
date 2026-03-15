/**
 * Admin dashboard index — links to moderation, users, policies (COMP-032.6).
 */

import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1>Admin</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ marginBottom: "0.5rem" }}>
          <Link href="/admin/moderation">Moderation — flag queue</Link>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Link href="/admin/users">User management</Link>
        </li>
        <li style={{ marginBottom: "0.5rem" }}>
          <Link href="/admin/policies">Platform policies</Link>
        </li>
      </ul>
    </div>
  );
}
