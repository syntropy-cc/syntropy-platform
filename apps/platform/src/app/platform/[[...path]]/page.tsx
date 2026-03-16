/**
 * Redirect /platform/* to /dashboard (ADR-012).
 * Legacy /platform/* links redirect to shared user area.
 */

import { redirect } from "next/navigation";

export default function PlatformCatchAllRedirectPage() {
  redirect("/dashboard");
}
