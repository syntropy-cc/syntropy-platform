"use client";

/**
 * Global layout with top navigation (Platform, Learn, Hub, Labs).
 * Architecture: COMP-032
 */

import React from "react";
import { cn } from "../lib/utils";

export interface NavLinkConfig {
  href: string;
  label: string;
}

const DEFAULT_NAV_LINKS: NavLinkConfig[] = [
  { href: "/", label: "Platform" },
  { href: "/learn", label: "Learn" },
  { href: "/hub", label: "Hub" },
  { href: "/labs", label: "Labs" },
];

export interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Override nav links (e.g. full URLs for other apps). */
  navLinks?: NavLinkConfig[];
  /** Optional slot for header right (e.g. ThemeToggle, user menu). */
  headerRight?: React.ReactNode;
}

export function AppLayout({
  children,
  className,
  navLinks = DEFAULT_NAV_LINKS,
  headerRight,
}: AppLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background text-foreground", className)}>
      <header
        className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background px-4"
        role="banner"
      >
        <nav className="flex flex-1 items-center gap-6" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
        {headerRight != null ? <div className="flex items-center gap-2">{headerRight}</div> : null}
      </header>
      <main className="flex-1 p-4" role="main">
        {children}
      </main>
    </div>
  );
}
