/**
 * Hub app root layout — design system (COMP-032.1).
 */

import type { Metadata } from "next";
import { ThemeProvider, AppLayout, ThemeToggle } from "@syntropy/ui";

const HUB_NAV_LINKS = [
  { href: "http://localhost:3000", label: "Platform" },
  { href: "http://localhost:3001", label: "Learn" },
  { href: "/", label: "Hub" },
  { href: "http://localhost:3003", label: "Labs" },
];

export const metadata: Metadata = {
  title: "Syntropy Hub",
  description: "Open-source-style collaboration — Syntropy Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppLayout navLinks={HUB_NAV_LINKS} headerRight={<ThemeToggle />}>
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
