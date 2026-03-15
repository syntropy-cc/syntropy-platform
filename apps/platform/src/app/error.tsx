"use client";

/**
 * Root error boundary — catches runtime errors and shows user-friendly message (COMP-032.8).
 * Displays correlation ID / digest for support.
 */

import React, { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to reporting service in production
    console.error("Application error:", error);
  }, [error]);

  const refId = error.digest ?? (error as Error & { correlationId?: string }).correlationId;

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui", maxWidth: "40rem" }}>
      <h1>Something went wrong</h1>
      <p>We encountered an unexpected error. Please try again.</p>
      {refId && (
        <p style={{ fontSize: "0.875rem", color: "var(--color-muted, #666)" }}>
          Reference for support: <code>{refId}</code>
        </p>
      )}
      <p>
        <button
          type="button"
          onClick={() => reset()}
          style={{ marginRight: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Try again
        </button>
        <Link href="/">Go home</Link>
        {" · "}
        <Link href="/dashboard">Dashboard</Link>
      </p>
    </main>
  );
}
