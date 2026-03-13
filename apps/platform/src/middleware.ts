/**
 * Middleware — refreshes Supabase session and redirects unauthenticated users to /login (COMP-032.2).
 */

import { createClient } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    return Response.redirect(loginUrl, 302);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
