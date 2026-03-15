/**
 * Root loading state — skeleton while layout/page loads (COMP-032.8).
 */

export default function Loading() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <div style={{ height: "1.5rem", width: "12rem", background: "var(--color-muted, #e5e7eb)", borderRadius: 4 }} />
      <div style={{ height: "1rem", width: "100%", maxWidth: "40rem", marginTop: "1rem", background: "var(--color-muted, #e5e7eb)", borderRadius: 4 }} />
      <div style={{ height: "1rem", width: "80%", maxWidth: "32rem", marginTop: "0.5rem", background: "var(--color-muted, #e5e7eb)", borderRadius: 4 }} />
    </main>
  );
}
