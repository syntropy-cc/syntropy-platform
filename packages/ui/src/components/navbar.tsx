"use client";

/**
 * Navbar — logo, institutional landing links, headerRight, mobile Sheet.
 * COMPONENT-LIBRARY: Navbar
 */

import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "../lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";

export interface NavbarLink {
  href: string;
  label: string;
}

export interface NavbarProps {
  /** Links to institutional landings (e.g. /, /learn, /hub, /labs). */
  navLinks: NavbarLink[];
  /** Right slot: ThemeToggle, UserMenu. */
  headerRight?: React.ReactNode;
  /** Current path for active state (e.g. from usePathname()). */
  currentPath?: string;
  /** Logo text. */
  logoText?: string;
  /** Logo href (default /). */
  logoHref?: string;
  className?: string;
}

export function Navbar({
  navLinks,
  headerRight,
  currentPath = "",
  logoText = "Syntropy",
  logoHref = "/",
  className,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center gap-4 border-b px-4",
        "bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-[var(--glass-border)]",
        className
      )}
      role="banner"
    >
      <nav className="flex flex-1 items-center gap-6" aria-label="Main navigation">
        <a
          href={logoHref}
          className="text-lg font-semibold text-foreground hover:opacity-90"
        >
          {logoText}
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-primary/15 text-primary shadow-[var(--shadow-nav-active)]"
                  : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
              )}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
      <div className="flex items-center gap-2">
        {headerRight}
        <SheetTrigger
          onClick={() => setMobileOpen(true)}
          className="md:hidden rounded-md p-2 text-foreground hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
      </div>
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SheetContent className="pt-8">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/80 hover:bg-muted"
                )}
              >
                {label}
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
