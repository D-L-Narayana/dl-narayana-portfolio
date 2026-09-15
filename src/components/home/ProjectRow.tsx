'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Picture } from '@/components/ui/Picture';
import { Reveal } from '@/components/ui/Reveal';
import { SystemDiagram } from '@/components/ui/SystemDiagram';
import { CATEGORY_LABEL } from '@/data/projects';
import type { Project } from '@/lib/github';
import { relative } from '@/lib/format';

type Props = { project: Project; index: number; flip?: boolean; fetchedAt: string; priority?: boolean };

/** Editorial project row: image/diagram (7 cols) + copy (5 cols), alternating sides. The visual
 *  drifts ±6 % on scroll inside its mask and scales 1.03 on hover — transform-only. */
export function ProjectRow({ project: p, index, flip = false, fetchedAt, priority = false }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%']);
  const href = `/work/${p.slug}/`;

  return (
    <article ref={ref} className="hairline grid-12 items-center gap-y-8 py-10 md:py-16">
      <Reveal className={`col-span-12 md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
        <TransitionLink href={href} className="media group block aspect-[16/10]" data-cursor="view" aria-label={`${p.title} — open case study`}>
          {p.image ? (
            <motion.div className="h-[112%] w-full -translate-y-[6%] will-change-transform" style={{ y }}>
              <motion.div className="h-full w-full" whileHover={reduce ? undefined : { scale: 1.03 }} transition={{ type: 'spring', stiffness: 160, damping: 26 }}>
                <Picture base={p.image} alt={`${p.title} — screenshot of the live product`} priority={priority} sizes="(min-width: 768px) 58vw, 100vw" className="h-full w-full" />
              </motion.div>
            </motion.div>
          ) : p.diagram ? (
            <motion.div className="h-full w-full" whileHover={reduce ? undefined : { scale: 1.02 }} transition={{ type: 'spring', stiffness: 160, damping: 26 }}>
              <SystemDiagram diagram={p.diagram} title={p.title} />
            </motion.div>
          ) : null}
        </TransitionLink>
      </Reveal>

      <div className={`col-span-12 md:col-span-5 ${flip ? 'md:order-1 md:pr-8' : 'md:pl-8'}`}>
        <Reveal delay={0.08}>
          <p className="eyebrow flex items-center gap-3">
            <span className="text-accent">{String(index + 1).padStart(2, '0')}</span>
            <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
            {CATEGORY_LABEL[p.category]}
          </p>
          <h3 className="mt-4 font-display text-[clamp(1.75rem,1.3rem+1.8vw,2.75rem)] leading-[1.02]">
            <TransitionLink href={href} className="link-underline">
              {p.title}
            </TransitionLink>
          </h3>
          <p className="mt-4 text-muted">{p.tagline}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            {p.results.slice(0, 2).map((m) => (
              <div key={m.label} className="flex flex-col border-l border-border pl-4">
                <dt className="order-2 mt-1 text-xs text-muted">{m.label}</dt>
                <dd className="order-1 tabular font-display text-2xl md:text-3xl">{m.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-6 flex flex-wrap gap-2" role="list" aria-label="Stack">
            {p.stack.slice(0, 5).map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <TransitionLink href={href} className="link-underline font-medium">
              Case study →
            </TransitionLink>
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noreferrer" className="link-underline text-muted hover:text-text">
                Live ↗
              </a>
            )}
            <a href={p.repoUrl} target="_blank" rel="noreferrer" className="link-underline text-muted hover:text-text">
              Code ↗
            </a>
            <span className="mono ml-auto text-xs text-faint">pushed {relative(p.pushedAt, fetchedAt)}</span>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
