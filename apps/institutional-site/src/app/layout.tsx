/**
 * Institutional Site root layout (COMP-036.1, COMP-036.4).
 * Read-only public pages for Digital Institutions.
 * Fonts preloaded via next/font for LCP/CLS (CON-004).
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@syntropy/ui";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Syntropy — Digital Institutions",
  description: "Public profiles for digital institutions on the Syntropy Platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
