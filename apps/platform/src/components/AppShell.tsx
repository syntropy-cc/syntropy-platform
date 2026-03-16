"use client";

/**
 * Client shell: ThemeProvider + AppLayout + AuthProvider.
 * Architecture: COMP-032
 */

import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider, AppLayout, ThemeToggle } from "@syntropy/ui";

const PLATFORM_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "http://localhost:3001", label: "Learn" },
  { href: "http://localhost:3002", label: "Hub" },
  { href: "http://localhost:3003", label: "Labs" },
  { href: "/dashboard", label: "Dashboard" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppLayout navLinks={PLATFORM_NAV_LINKS} headerRight={<ThemeToggle />}>
        <AuthProvider>{children}</AuthProvider>
      </AppLayout>
    </ThemeProvider>
  );
}
