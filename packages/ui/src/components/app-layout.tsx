"use client";

/**
 * Global layout with top navigation (Home, Learn, Hub, Labs, Dashboard).
 * Supports variant "default" (simple header) or "landing" (Navbar + Footer).
 * Architecture: COMP-032
 */

import React from "react";
import { cn } from "../lib/utils";
import { Navbar } from "./navbar";

export interface NavLinkConfig {
  href: string;
  label: string;
}

const DEFAULT_NAV_LINKS: NavLinkConfig[] = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/hub", label: "Hub" },
  { href: "/labs", label: "Labs" },
];

export interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** "default" = simple header; "landing" = Navbar (glass) + optional Footer. */
  variant?: "default" | "landing";
  /** Rendered below main when set (e.g. <Footer />). */
  footer?: React.ReactNode;
  /** Current path for landing Navbar active state (e.g. usePathname()). */
  currentPath?: string;
  /** Override nav links (institutional landings). */
  navLinks?: NavLinkConfig[];
  /** Optional slot for header right (e.g. ThemeToggle, UserMenu). */
  headerRight?: React.ReactNode;
}

export function AppLayout({
  children,
  className,
  variant = "default",
  footer,
  currentPath = "",
  navLinks = DEFAULT_NAV_LINKS,
  headerRight,
}: AppLayoutProps) {
  const isLanding = variant === "landing";

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-background text-foreground",
        className
      )}
    >
      {isLanding ? (
        <Navbar
          navLinks={navLinks}
          headerRight={headerRight}
          currentPath={currentPath}
        />
      ) : (
        <header
          className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background px-4"
          role="banner"
        >
          <nav
            className="flex flex-1 items-center gap-6"
            aria-label="Main navigation"
          >
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
          {headerRight != null ? (
            <div className="flex items-center gap-2">{headerRight}</div>
          ) : null}
        </header>
      )}
      <main className="flex-1 p-4" role="main">
        {children}
      </main>
      {footer != null ? footer : null}
    </div>
  );
}
