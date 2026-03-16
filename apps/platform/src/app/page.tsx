/**
 * Institutional home — main entry point (COMP-032.10, ADR-012).
 * Presents the ecosystem, three pillars (Learn, Hub, Labs), and login/signup.
 */

import Link from "next/link";

export default function InstitutionalHomePage() {
  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "system-ui",
        maxWidth: "48rem",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "1.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Syntropy — Digital Institutions
      </h1>
      <p style={{ color: "var(--muted-foreground, #6b7280)", marginBottom: "1.5rem" }}>
        Persistent digital institutions with formal governance, value distribution,
        and artifact registries. One ecosystem, three pillars.
      </p>

      <section style={{ marginBottom: "1.5rem" }} aria-label="Three pillars">
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Learn, Hub, Labs
        </h2>
        <ul style={{ listStyle: "disc", paddingLeft: "1.5rem", marginBottom: "1rem" }}>
          <li>
            <strong>Learn</strong> — Structured learning paths; every fragment builds
            a real artifact.
          </li>
          <li>
            <strong>Hub</strong> — Open-source-style collaboration with institutional
            governance and IDE sessions.
          </li>
          <li>
            <strong>Labs</strong> — Scientific publishing with peer review, DOI
            issuance, and data provenance.
          </li>
        </ul>
      </section>

      <p style={{ marginBottom: "1rem" }}>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            marginRight: "0.75rem",
            padding: "0.5rem 1rem",
            background: "var(--primary, #2563eb)",
            color: "var(--primary-foreground, #fff)",
            borderRadius: "0.375rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Log in
        </Link>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: "0.375rem",
            fontWeight: 500,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          Get started
        </Link>
      </p>

      <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground, #6b7280)" }}>
        After signing in, you can access Learn, Hub, Labs, and your dashboard
        (portfolio, search, recommendations, planning, settings).
      </p>
    </main>
  );
}
