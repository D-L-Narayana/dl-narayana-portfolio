'use client';

import { motion } from 'motion/react';
import { monthYear } from '@/lib/format';

type Week = { start: string; count: number };

/** 26 weekly columns; each bar grows with scaleY from the baseline (origin bottom), staggered. */
export function ActivityBars({ weeks }: { weeks: Week[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const months: { label: string; index: number }[] = [];
  weeks.forEach((w, i) => {
    const m = w.start.slice(0, 7);
    if (!months.length || months[months.length - 1].label !== m) months.push({ label: m, index: i });
  });
  return (
    <figure>
      <motion.div className="grid h-40 items-end gap-[3px] md:h-48" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }} role="img" aria-label={`Weekly commits over the last ${weeks.length} weeks, peaking at ${max} in one week`}>
        {weeks.map((w) => (
          <motion.div key={w.start} className="bar h-full" style={{ height: `${Math.max(2, (Math.sqrt(w.count) / Math.sqrt(max)) * 100)}%`, opacity: w.count ? 1 : 0.25 }} variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { type: 'spring', stiffness: 160, damping: 22 } } }} title={`Week of ${w.start}: ${w.count} commits`} />
        ))}
      </motion.div>
      <figcaption className="mono mt-3 grid text-[11px] text-faint" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {months.map((m) => (
          <span key={m.label} style={{ gridColumnStart: m.index + 1 }} className="col-span-2 whitespace-nowrap">
            {monthYear(m.label).split(' ')[0]}
          </span>
        ))}
      </figcaption>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted" role="list">
        <li>
          Peak <span className="tabular text-text">{max}</span> commits in a week
        </li>
        <li>
          Busiest week: <span className="text-text">{monthYear(weeks.reduce((a, b) => (b.count > a.count ? b : a)).start.slice(0, 7))}</span>
        </li>
        <li className="mono text-faint">square-root scale</li>
      </ul>
    </figure>
  );
}

/** Stacked language bar; each segment scales in from the left. Amber lightness steps, labelled. */
export function LanguageBar({ langs }: { langs: { name: string; pct: number }[] }) {
  const opacities = [1, 0.7, 0.5, 0.35, 0.25, 0.18];
  return (
    <figure>
      <motion.div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} role="img" aria-label={langs.map((l) => `${l.name} ${l.pct}%`).join(', ')}>
        {langs.map((l, i) => (
          <motion.span key={l.name} className="block h-full origin-left bg-accent" style={{ width: `${l.pct}%`, opacity: opacities[i] ?? 0.15 }} variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { type: 'spring', stiffness: 140, damping: 24 } } }} />
        ))}
      </motion.div>
      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm" role="list">
        {langs.map((l, i) => (
          <li key={l.name} className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
            <span className="flex items-center gap-2">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-accent" style={{ opacity: opacities[i] ?? 0.15 }} />
              {l.name}
            </span>
            <span className="mono tabular text-xs text-muted">{l.pct.toFixed(1)} %</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
