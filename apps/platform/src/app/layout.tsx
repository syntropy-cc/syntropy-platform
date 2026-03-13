/**
 * Root layout — design system + auth (COMP-032.1, COMP-032.2).
 * Architecture: platform/web-application/ARCHITECTURE.md
 */

import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syntropy Platform",
  description: "Syntropy Platform — Learn, Hub, Labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
