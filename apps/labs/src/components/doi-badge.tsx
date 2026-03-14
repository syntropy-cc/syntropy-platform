/**
 * DOI badge — link to doi.org (COMP-032.5).
 */

export interface DoiBadgeProps {
  doi: string;
  className?: string;
}

export function DoiBadge({ doi, className = "" }: DoiBadgeProps) {
  const href = `https://doi.org/${encodeURIComponent(doi)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center rounded-md border border-border bg-muted px-2 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground ${className}`}
      title="View on doi.org"
    >
      <span className="font-mono">{doi}</span>
    </a>
  );
}
