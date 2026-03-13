/**
 * Learn app root layout — design system (COMP-032.1).
 */

import type { Metadata } from "next";
import { ThemeProvider, AppLayout, ThemeToggle } from "@syntropy/ui";

const LEARN_NAV_LINKS = [
  { href: "http://localhost:3000", label: "Platform" },
  { href: "/", label: "Learn" },
  { href: "http://localhost:3002", label: "Hub" },
  { href: "http://localhost:3003", label: "Labs" },
];

export const metadata: Metadata = {
  title: "Syntropy Learn",
  description: "Structured learning paths — Syntropy Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppLayout navLinks={LEARN_NAV_LINKS} headerRight={<ThemeToggle />}>
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
