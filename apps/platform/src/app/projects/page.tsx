/**
 * Redirect /projects → /hub (syntropy reference uses /projects; platform uses /hub).
 */

import { redirect } from "next/navigation";

export default function ProjectsRedirectPage() {
  redirect("/hub");
}
