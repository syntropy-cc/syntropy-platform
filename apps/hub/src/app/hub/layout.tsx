/**
 * Hub section layout — nav for discover, institutions, issues, contribute (COMP-032.4).
 */

import Link from "next/link";

const HUB_NAV = [
  { href: "/hub", label: "Discover" },
  { href: "/hub/issues", label: "Issues" },
];

export default function HubLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="space-y-6">
      <nav className="flex gap-4 border-b border-border pb-2">
        {HUB_NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
