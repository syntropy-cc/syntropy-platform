/**
 * Labs app root layout — design system (COMP-032.1).
 */

import type { Metadata } from "next";
import { ThemeProvider, AppLayout, ThemeToggle } from "@syntropy/ui";

const LABS_NAV_LINKS = [
  { href: "http://localhost:3000", label: "Platform" },
  { href: "http://localhost:3001", label: "Learn" },
  { href: "http://localhost:3002", label: "Hub" },
  { href: "/", label: "Labs" },
];

export const metadata: Metadata = {
  title: "Syntropy Labs",
  description: "Scientific publishing and peer review — Syntropy Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppLayout navLinks={LABS_NAV_LINKS} headerRight={<ThemeToggle />}>
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
