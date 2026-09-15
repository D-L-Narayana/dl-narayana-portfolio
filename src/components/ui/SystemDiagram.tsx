'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import type { Diagram } from '@/data/projects';

/**
 * Architecture drawn from the README's stage list: boxes on a rail, a branch for quarantine/blocked
 * paths, an orchestrator caption. Paths draw in on view (pathLength — a transform-free SVG property).
 */
/** Readable at any width: the SVG schematic on wide layouts, a chip flow on narrow ones. */
export function SystemDiagram({ diagram, title, compact = false }: { diagram: Diagram; title: string; compact?: boolean }) {
  if (compact) return <ChipFlow diagram={diagram} title={title} />;
  return (
    <>
      <div className="hidden h-full w-full md:block">
        <SchematicSvg diagram={diagram} title={title} />
      </div>
      <div className="h-full w-full md:hidden">
        <ChipFlow diagram={diagram} title={title} />
      </div>
    </>
  );
}

function ChipFlow({ diagram, title }: { diagram: Diagram; title: string }) {
  const n = diagram.stages.length;
  return (
    <div className="flex h-full w-full flex-col justify-between bg-surface-2 p-5" role="img" aria-label={`${title} architecture: ${diagram.stages.join(' → ')}`}>
      <p className="mono text-xs uppercase tracking-[0.08em] text-muted">{title} · architecture</p>
      <ol className="flex flex-wrap items-center gap-y-3 py-4" role="list">
        {diagram.stages.map((s, i) => (
          <li key={s} className="flex items-center">
            <span className={`rounded-lg border px-3 py-1.5 text-[13px] font-semibold leading-none ${i === n - 1 ? 'border-accent bg-accent text-on-accent' : 'border-border-strong bg-surface text-text'}`}>{s}</span>
            {i < n - 1 && (
              <span aria-hidden className="mx-1.5 text-faint">
                →
              </span>
            )}
          </li>
        ))}
        {diagram.branch && (
          <li className="flex items-center">
            <span aria-hidden className="mx-1.5 text-faint">
              ↘
            </span>
            <span className="rounded-lg border border-dashed border-border-strong px-3 py-1.5 text-[12px] leading-none text-muted">{diagram.branch.label}</span>
          </li>
        )}
      </ol>
      {diagram.orchestrator && <p className="mono text-xs text-muted">{diagram.orchestrator}</p>}
    </div>
  );
}

function SchematicSvg({ diagram, title }: { diagram: Diagram; title: string }) {
  const n = diagram.stages.length;
  const W = 1200;
  const H = 750;
  const padX = 48;
  const boxW = Math.min(150, (W - padX * 2) / n - 20);
  const gap = (W - padX * 2 - boxW * n) / (n - 1);
  const railY = H * 0.46;
  const boxH = 64;
  const xs = diagram.stages.map((_, i) => padX + i * (boxW + gap));
  const branchIndex = diagram.branch?.from ?? -1;
  const goldIndex = n - 1;
  const ref = useRef<SVGSVGElement>(null);
  const pid = `grid-${title.replace(/\W+/g, '-').toLowerCase()}`;
  const inView = useInView(ref, { margin: '0px' });

  return (
    <motion.svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${title} architecture: ${diagram.stages.join(' → ')}${diagram.branch ? `, with a ${diagram.branch.label.toLowerCase()} branch` : ''}`}
      className="h-full w-full"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      <defs>
        <pattern id={pid} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--border)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="var(--surface-2)" />
      <rect width={W} height={H} fill={`url(#${pid})`} opacity="0.7" />

      {/* rail */}
      <motion.line
        x1={xs[0] + boxW}
        x2={xs[n - 1]}
        y1={railY}
        y2={railY}
        stroke="var(--border-strong)"
        strokeWidth="2"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } } }}
      />
      {/* moving events on the rail — translate-only, rendered only while in view */}
      {inView &&
        [0, 1, 2, 3, 4].map((k) => (
          <motion.g key={k} initial={{ x: 0, opacity: 0 }} animate={{ x: [0, xs[n - 1] - xs[0] - boxW], opacity: [0, 1, 1, 0] }} transition={{ duration: 6, ease: 'linear', repeat: Infinity, delay: k * 1.2 }}>
            <circle r="4" cx={xs[0] + boxW} cy={railY} fill="var(--accent)" />
          </motion.g>
        ))}

      {/* branch */}
      {diagram.branch && branchIndex >= 0 && (
        <g>
          <motion.path
            d={`M ${xs[branchIndex] + boxW / 2} ${railY + boxH / 2} C ${xs[branchIndex] + boxW / 2} ${railY + 140}, ${xs[branchIndex] + boxW / 2 + 60} ${railY + 150}, ${xs[branchIndex] + boxW / 2 + 90} ${railY + 170}`}
            fill="none"
            stroke="var(--text-faint)"
            strokeWidth="2"
            strokeDasharray="6 8"
            variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
          />
          <motion.g variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1.3 } } }}>
            <rect x={xs[branchIndex] + boxW / 2 + 90} y={railY + 150} width="150" height="40" rx="8" fill="var(--surface)" stroke="var(--border-strong)" strokeDasharray="4 6" />
            <text x={xs[branchIndex] + boxW / 2 + 165} y={railY + 175} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill="var(--text-muted)">
              {diagram.branch.label}
            </text>
          </motion.g>
        </g>
      )}

      {/* stages */}
      {diagram.stages.map((s, i) => {
        const gold = i === goldIndex;
        return (
          <motion.g key={s} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.12, type: 'spring', stiffness: 200, damping: 26 } } }}>
            <rect x={xs[i]} y={railY - boxH / 2} width={boxW} height={boxH} rx="12" fill={gold ? 'var(--accent)' : 'var(--surface)'} stroke={gold ? 'var(--accent)' : 'var(--border-strong)'} strokeWidth="1.5" />
            <text x={xs[i] + boxW / 2} y={railY + 6} textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600" fontSize={boxW < 120 ? 14 : boxW < 150 ? 15 : 17} fill={gold ? 'var(--on-accent)' : 'var(--text)'}>
              {s}
            </text>
            <text x={xs[i] + boxW / 2} y={railY - boxH / 2 - 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--text-faint)">
              {String(i + 1).padStart(2, '0')}
            </text>
          </motion.g>
        );
      })}

      {diagram.orchestrator && (
        <motion.text x={W - padX} y={H - 40} textAnchor="end" fontFamily="var(--font-mono)" fontSize="15" fill="var(--text-muted)" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1.2 } } }}>
          {diagram.orchestrator}
        </motion.text>
      )}
      <text x={padX} y={H - 40} fontFamily="var(--font-mono)" fontSize="15" fill="var(--text-muted)">
        {title} · architecture
      </text>
    </motion.svg>
  );
}
