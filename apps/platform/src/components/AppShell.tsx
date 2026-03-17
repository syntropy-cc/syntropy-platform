"use client";

/**
 * Client shell: ThemeProvider + AppLayout + AuthProvider.
 * Uses pathname to switch between landing layout (Navbar + Footer) and default layout.
 * Architecture: COMP-032
 */

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { UserMenu } from "@/components/UserMenu";
import {
  ThemeProvider,
  AppLayout,
  ThemeToggle,
  Footer,
  Logo,
} from "@syntropy/ui";

/** Links to institutional landings (platform routes). */
const INSTITUTIONAL_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/hub", label: "Hub" },
  { href: "/labs", label: "Labs" },
];

/** Paths that use landing variant (Navbar + Footer). */
const INSTITUTIONAL_PATHS = [
  "/",
  "/learn",
  "/hub",
  "/labs",
  "/portfolio",
  "/contribute",
];

function useIsInstitutionalPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  return INSTITUTIONAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = useIsInstitutionalPath(pathname);

  const landingLogo = (
    <Logo src="/syntropy-logo.png" width={120} height={32} alt="Syntropy" />
  );

  return (
    <ThemeProvider>
      <AppLayout
        variant={isLanding ? "landing" : "default"}
        footer={isLanding ? <Footer logo={landingLogo} /> : undefined}
        currentPath={pathname ?? ""}
        navLinks={INSTITUTIONAL_NAV_LINKS}
        logo={isLanding ? landingLogo : undefined}
        headerRight={
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        }
      >
        <AuthProvider>{children}</AuthProvider>
      </AppLayout>
    </ThemeProvider>
  );
}
