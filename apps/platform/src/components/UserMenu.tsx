"use client";

/**
 * UserMenu — avatar/email dropdown (Log out, Dashboard) or "Log in" when not authenticated.
 * Used in Navbar headerRight when variant=landing.
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@syntropy/ui";
import { cn } from "@syntropy/ui";

export function UserMenu() {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <span className="text-sm text-muted-foreground" aria-hidden>
        ...
      </span>
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="ghost" size="sm">
          Log in
        </Button>
      </Link>
    );
  }

  const email = user.email ?? "Account";
  const initial = email.slice(0, 1).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/90 hover:bg-white/5 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-medium"
          aria-hidden
        >
          {initial}
        </span>
        <span className="hidden max-w-[120px] truncate sm:inline">{email}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-background py-1 shadow-lg"
          role="menu"
        >
          <div className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
            {email}
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
            role="menuitem"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <a
            href="/logout"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
            role="menuitem"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </a>
        </div>
      )}
    </div>
  );
}
