/**
 * Labs app root — redirect to /labs (COMP-032.5).
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/labs");
}
