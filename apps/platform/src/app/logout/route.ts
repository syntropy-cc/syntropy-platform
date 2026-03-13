/**
 * Logout route — clears Supabase session and redirects to / (COMP-032.2).
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL("/", request.nextUrl.origin);
  return NextResponse.redirect(url, 302);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
