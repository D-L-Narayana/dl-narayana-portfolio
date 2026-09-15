'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import type { Diagram } from '@/data/projects';

/**
 * Architecture drawn from the README's stage list: boxes on a rail, a branch for quarantine/blocked
 * paths, an orchestrator caption. Paths draw in on view (pathLength — a transform-free SVG property).
 */
type Props = { diagram: Diagram; title: string; compact?: boolean; variant?: 'horizontal' | 'vertical'; ratio?: number };

/** Readable at any width: the SVG schematic on wide layouts (horizontal rail, or a vertical rail for
 *  tall containers), a chip flow on narrow ones. `ratio` sets the horizontal viewBox aspect so the
 *  drawing fills its box exactly (16/10 by default, 21/10 on case-study heroes). */
export function SystemDiagram({ diagram, title, compact = false, variant = 'horizontal', ratio = 16 / 10 }: Props) {
  if (compact) return <ChipFlow diagram={diagram} title={title} />;
  return (
    <>
      <div className="hidden h-full w-full md:block">
        {variant === 'vertical' ? <VerticalSvg diagram={diagram} title={title} /> : <SchematicSvg diagram={diagram} title={title} ratio={ratio} />}
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

function SchematicSvg({ diagram, title, ratio }: { diagram: Diagram; title: string; ratio: number }) {
  const n = diagram.stages.length;
  const W = 1200;
  const H = Math.round(W / ratio);
  const padX = 56;
  const boxW = Math.min(164, (W - padX * 2) / n - 16);
  const gap = (W - padX * 2 - boxW * n) / (n - 1);
  const railY = H * 0.42;
  const boxH = 92;
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
        strokeWidth="2.5"
        variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } } }}
      />
      {/* moving events on the rail — translate-only, rendered only while in view */}
      {inView &&
        [0, 1, 2, 3, 4].map((k) => (
          <motion.g key={k} initial={{ x: 0, opacity: 0 }} animate={{ x: [0, xs[n - 1] - xs[0] - boxW], opacity: [0, 1, 1, 0] }} transition={{ duration: 6, ease: 'linear', repeat: Infinity, delay: k * 1.2 }}>
            <circle r="5" cx={xs[0] + boxW} cy={railY} fill="var(--accent)" />
          </motion.g>
        ))}

      {/* branch */}
      {diagram.branch && branchIndex >= 0 && (
        <g>
          <motion.path
            d={`M ${xs[branchIndex] + boxW / 2} ${railY + boxH / 2} C ${xs[branchIndex] + boxW / 2} ${railY + 170}, ${xs[branchIndex] + boxW / 2 + 60} ${railY + 180}, ${xs[branchIndex] + boxW / 2 + 90} ${railY + 200}`}
            fill="none"
            stroke="var(--text-faint)"
            strokeWidth="2"
            strokeDasharray="6 8"
            variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
          />
          <motion.g variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1.3 } } }}>
            <rect x={xs[branchIndex] + boxW / 2 + 90} y={railY + 178} width="190" height="50" rx="10" fill="var(--surface)" stroke="var(--border-strong)" strokeDasharray="4 6" />
            <text x={xs[branchIndex] + boxW / 2 + 185} y={railY + 209} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="17" fill="var(--text-muted)">
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
            <text x={xs[i] + boxW / 2} y={railY + 7} textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600" fontSize={boxW < 130 ? 17 : boxW < 160 ? 19 : 21} fill={gold ? 'var(--on-accent)' : 'var(--text)'}>
              {s}
            </text>
            <text x={xs[i] + boxW / 2} y={railY - boxH / 2 - 18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill="var(--text-faint)">
              {String(i + 1).padStart(2, '0')}
            </text>
          </motion.g>
        );
      })}

      {diagram.orchestrator && (
        <motion.text x={W - padX} y={H - 44} textAnchor="end" fontFamily="var(--font-mono)" fontSize="17" fill="var(--text-muted)" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1.2 } } }}>
          {diagram.orchestrator}
        </motion.text>
      )}
      <text x={padX} y={H - 44} fontFamily="var(--font-mono)" fontSize="17" fill="var(--text-muted)">
        {title} · architecture
      </text>
    </motion.svg>
  );
}


/** Tall containers (the stacked home cards): stages descend a central rail, the branch peels off to
 *  the right, events fall down the rail. Cropping is safe on the sides (nothing lives there). */
function VerticalSvg({ diagram, title }: { diagram: Diagram; title: string }) {
  const n = diagram.stages.length;
  const W = 700;
  const H = 800;
  const boxW = 250;
  const boxH = 66;
  const top = 128;
  const bottom = 700;
  const step = (bottom - top - boxH) / (n - 1);
  const cx = diagram.branch ? 270 : W / 2;
  const ys = diagram.stages.map((_, i) => top + i * step);
  const branchIndex = diagram.branch?.from ?? -1;
  const goldIndex = n - 1;
  const ref = useRef<SVGSVGElement>(null);
  const pid = `vgrid-${title.replace(/\W+/g, '-').toLowerCase()}`;
  const inView = useInView(ref, { margin: '0px' });
  const railLen = ys[n - 1] - (ys[0] + boxH);

  return (
    <motion.svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
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
      <motion.line x1={cx} x2={cx} y1={ys[0] + boxH} y2={ys[n - 1]} stroke="var(--border-strong)" strokeWidth="2.5" variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } } }} />
      {inView &&
        [0, 1, 2, 3].map((k) => (
          <motion.g key={k} initial={{ y: 0, opacity: 0 }} animate={{ y: [0, railLen], opacity: [0, 1, 1, 0] }} transition={{ duration: 5, ease: 'linear', repeat: Infinity, delay: k * 1.25 }}>
            <circle r="5" cx={cx} cy={ys[0] + boxH} fill="var(--accent)" />
          </motion.g>
        ))}
      {diagram.branch && branchIndex >= 0 && (
        <g>
          <motion.path
            d={`M ${cx + boxW / 2} ${ys[branchIndex] + boxH / 2} C ${cx + boxW / 2 + 90} ${ys[branchIndex] + boxH / 2}, ${cx + boxW / 2 + 90} ${ys[branchIndex] + boxH / 2 + step}, ${cx + boxW / 2 + 60} ${ys[branchIndex] + boxH / 2 + step + 40}`}
            fill="none"
            stroke="var(--text-faint)"
            strokeWidth="2"
            strokeDasharray="6 8"
            variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] } } }}
          />
          <motion.g variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1.3 } } }}>
            <rect x={cx + boxW / 2 + 40} y={ys[branchIndex] + boxH / 2 + step + 40} width="190" height="48" rx="10" fill="var(--surface)" stroke="var(--border-strong)" strokeDasharray="4 6" />
            <text x={cx + boxW / 2 + 135} y={ys[branchIndex] + boxH / 2 + step + 70} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="16" fill="var(--text-muted)">
              {diagram.branch.label}
            </text>
          </motion.g>
        </g>
      )}
      {diagram.stages.map((s, i) => {
        const gold = i === goldIndex;
        return (
          <motion.g key={s} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.12, type: 'spring', stiffness: 200, damping: 26 } } }}>
            <rect x={cx - boxW / 2} y={ys[i]} width={boxW} height={boxH} rx="12" fill={gold ? 'var(--accent)' : 'var(--surface)'} stroke={gold ? 'var(--accent)' : 'var(--border-strong)'} strokeWidth="1.5" />
            <text x={cx} y={ys[i] + boxH / 2 + 7} textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600" fontSize="20" fill={gold ? 'var(--on-accent)' : 'var(--text)'}>
              {s}
            </text>
            <text x={cx - boxW / 2 - 22} y={ys[i] + boxH / 2 + 5} textAnchor="end" fontFamily="var(--font-mono)" fontSize="15" fill="var(--text-faint)">
              {String(i + 1).padStart(2, '0')}
            </text>
          </motion.g>
        );
      })}
      <text x={W / 2} y={60} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="16" fill="var(--text-muted)">
        {title} · architecture
      </text>
      {diagram.orchestrator && (
        <motion.text x={W / 2} y={H - 40} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="16" fill="var(--text-muted)" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1.2 } } }}>
          {diagram.orchestrator}
        </motion.text>
      )}
    </motion.svg>
  );
}
