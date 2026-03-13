/**
 * Root layout — wraps app with AuthProvider (COMP-032.2).
 * Architecture: platform/web-application/ARCHITECTURE.md
 */

import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
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
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
