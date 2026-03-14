/**
 * Learn app root — redirect to /learn (COMP-032.3).
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/learn");
}
