'use client';

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Picture } from '@/components/ui/Picture';
import { SystemDiagram } from '@/components/ui/SystemDiagram';
import { CATEGORY_LABEL, type Category } from '@/data/projects';
import type { Project } from '@/lib/github';
import { relative } from '@/lib/format';

const filters: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'data', label: 'Data' },
  { key: 'ai', label: 'AI' },
  { key: 'web', label: 'Product' },
  { key: 'tools', label: 'Tools' },
];

/** Filterable grid: the active pill slides between filters (layoutId), cards re-flow with layout
 *  animations and exit/enter through AnimatePresence. */
export function WorkGrid({ projects, fetchedAt }: { projects: Project[]; fetchedAt: string }) {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const reduce = useReducedMotion();
  const visible = projects.filter((p) => filter === 'all' || p.category === filter);

  return (
    <div className="mt-14">
      <LayoutGroup id="work-filters">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects by kind">
          {filters.map((f) => {
            const active = f.key === filter;
            const count = f.key === 'all' ? projects.length : projects.filter((p) => p.category === f.key).length;
            return (
              <button key={f.key} role="tab" type="button" aria-selected={active} onClick={() => setFilter(f.key)} className={`relative isolate rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? 'text-on-accent' : 'text-muted hover:text-text'}`}>
                {active && <motion.span layoutId="filter-pill" className="absolute inset-0 -z-10 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">
                  {f.label} <span className="mono text-xs opacity-70">{count}</span>
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <motion.ul layout={!reduce} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((p, i) => (
            <motion.li
              key={p.slug}
              layout={!reduce}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: Math.min(i * 0.03, 0.3) }}
            >
              <TransitionLink href={`/work/${p.slug}/`} className="card group block h-full overflow-hidden" data-cursor="view">
                <div className="media aspect-[16/10] !rounded-none !border-0 !border-b !border-border">
                  <motion.div className="h-full w-full" whileHover={reduce ? undefined : { scale: 1.04 }} transition={{ type: 'spring', stiffness: 160, damping: 26 }}>
                    {p.image ? <Picture base={p.image} alt={`${p.title} — screenshot`} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="h-full w-full" /> : p.diagram ? <SystemDiagram diagram={p.diagram} title={p.title} compact /> : null}
                  </motion.div>
                </div>
                <div className="p-5 md:p-6">
                  <p className="eyebrow flex items-center justify-between gap-3">
                    <span>{CATEGORY_LABEL[p.category]}</span>
                    <span className="text-faint normal-case tracking-normal">pushed {relative(p.pushedAt, fetchedAt)}</span>
                  </p>
                  <h2 className="mt-3 font-display text-2xl leading-tight">{p.title}</h2>
                  <p className="mt-2 text-sm text-muted">{p.tagline}</p>
                  <p className="mono mt-4 flex flex-wrap gap-x-4 text-xs text-faint">
                    <span>{p.language ?? '—'}</span>
                    <span>{p.commits} commits</span>
                    {p.liveUrl && <span className="text-accent">live ↗</span>}
                  </p>
                </div>
              </TransitionLink>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
