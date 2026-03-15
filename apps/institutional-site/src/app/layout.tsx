/**
 * Institutional Site root layout (COMP-036.1).
 * Read-only public pages for Digital Institutions.
 */

import type { Metadata } from "next";
import { ThemeProvider } from "@syntropy/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syntropy — Digital Institutions",
  description: "Public profiles for digital institutions on the Syntropy Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
