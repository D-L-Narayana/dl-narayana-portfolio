/** Inline SVG monogram: D · L · N drawn as three strokes sharing one baseline, with the amber
 *  "checkpoint" node where the N completes — the pipeline reaching Gold. currentColor throughout. */
export function Monogram({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size * 1.5} height={size} viewBox="0 0 48 32" fill="none" aria-hidden="true" className={className}>
      <path d="M3 4v24M3 4h7a12 12 0 0 1 0 24H3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 4v24h9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 28V4l9 24V6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="45" cy="4" r="2.6" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <Monogram size={22} />
      {!compact && (
        <span className="hidden whitespace-nowrap font-display text-[1.15rem] leading-none tracking-tight min-[360px]:inline">
          D L Narayana
        </span>
      )}
    </span>
  );
}
