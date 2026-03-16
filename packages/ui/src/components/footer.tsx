"use client";

/**
 * Footer — dark background, columns of links, copyright.
 * COMPONENT-LIBRARY: Footer
 */

import { cn } from "../lib/utils";

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterProps {
  /** Column groups (e.g. Aprenda, Construa, Comunidade). */
  columns?: FooterColumn[];
  /** Copyright line. */
  copyright?: string;
  /** Optional tagline or logo text above columns. */
  tagline?: string;
  className?: string;
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Aprenda",
    links: [
      { label: "Todos os Cursos", href: "/learn" },
      { label: "Trilhas de Aprendizagem", href: "/learn" },
      { label: "Certificações", href: "/learn" },
    ],
  },
  {
    title: "Construa",
    links: [
      { label: "Projetos", href: "/hub" },
      { label: "Laboratórios", href: "/labs" },
      { label: "Modelos", href: "/hub" },
    ],
  },
  {
    title: "Comunidade",
    links: [
      { label: "Discord", href: "#" },
      { label: "Fórum", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
];

export function Footer({
  columns = DEFAULT_COLUMNS,
  copyright = "© 2024 Syntropy. Todos os direitos reservados.",
  tagline = "Uma plataforma moderna de aprendizado para desenvolvedores dominarem novas tecnologias.",
  className,
}: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border bg-muted/50 text-muted-foreground",
        className
      )}
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {tagline && (
            <div className="md:col-span-1">
              <a href="/" className="text-lg font-semibold text-foreground">
                Syntropy
              </a>
              <p className="mt-2 text-sm">{tagline}</p>
            </div>
          )}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-border pt-6 text-center text-sm">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
