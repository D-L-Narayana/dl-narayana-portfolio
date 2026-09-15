/**
 * Procedural cover: a deterministic field of events (from the note's seed) crossing three gates,
 * drawn as SVG so it is crisp at any size, themable through CSS variables and weighs ~2 KB.
 */
function rng(seed: number) {
  let s = seed * 2654435761 + 12345;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function NoteCover({ seed, title, className = '' }: { seed: number; title: string; className?: string }) {
  const r = rng(seed);
  const W = 800, H = 500;
  const gates = [0.3, 0.55, 0.8];
  const events = Array.from({ length: 44 }, () => {
    const x = Math.round(r() * W);
    const y = Math.round(H * (0.18 + r() * 0.64));
    const len = Math.round(14 + r() * 70);
    const stage = gates.filter((g) => g * W < x).length;
    return { x, y, len, stage, w: Math.round((1 + r() * 1.5) * 10) / 10 };
  });
  const arcs = Array.from({ length: 2 }, (_, i) => {
    const x0 = Math.round(W * (0.08 + i * 0.4));
    const y0 = Math.round(H * (0.25 + r() * 0.5));
    const y1 = Math.round(H * (0.25 + r() * 0.5));
    return `M ${x0} ${y0} C ${x0 + 120} ${y0}, ${x0 + 120} ${y1}, ${x0 + 240} ${y1}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Abstract cover for “${title}”`} className={className} preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill="var(--surface-2)" />
      {gates.map((g, i) => (
        <line key={g} x1={g * W} x2={g * W} y1={H * 0.08} y2={H * 0.92} stroke={i === 2 ? 'var(--accent)' : 'var(--border-strong)'} strokeOpacity={i === 2 ? 0.7 : 1} strokeWidth="1.5" />
      ))}
      {arcs.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 8" opacity="0.7" />
      ))}
      {events.map((e, i) => (
        <line key={i} x1={e.x - e.len} x2={e.x} y1={e.y} y2={e.y} strokeWidth={e.w} strokeLinecap="round" stroke={e.stage === 3 ? 'var(--accent)' : e.stage === 2 ? 'var(--text-muted)' : 'var(--text-faint)'} opacity={e.stage === 3 ? 0.95 : e.stage === 2 ? 0.75 : 0.45} />
      ))}
      <text x={W * 0.3} y={H * 0.06} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="1.5" fill="var(--text-faint)">
        BRONZE
      </text>
      <text x={W * 0.55} y={H * 0.06} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="1.5" fill="var(--text-faint)">
        SILVER
      </text>
      <text x={W * 0.8} y={H * 0.06} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="1.5" fill="var(--accent)">
        GOLD
      </text>
    </svg>
  );
}
