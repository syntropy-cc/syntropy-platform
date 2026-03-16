/**
 * Redirect /auth?mode=signup (and other modes) → /login.
 * Keeps landing CTA link identical to syntropy reference.
 */

import { redirect } from "next/navigation";

export default function AuthPage() {
  redirect("/login");
}
