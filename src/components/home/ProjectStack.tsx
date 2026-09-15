'use client';

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Picture } from '@/components/ui/Picture';
import { SystemDiagram } from '@/components/ui/SystemDiagram';
import { CATEGORY_LABEL } from '@/data/projects';
import type { Project } from '@/lib/github';
import { relative } from '@/lib/format';

/** Only what the card renders — keeps the serialized client props small (see lib/github toStackProject). */
export type StackProject = Pick<Project, 'slug' | 'title' | 'category' | 'tagline' | 'summary' | 'stack' | 'liveUrl' | 'repoUrl' | 'pushedAt' | 'image' | 'diagram'> & { results: Project['results'] };

type Props = { projects: StackProject[]; fetchedAt: string };

/**
 * Stacked case studies. Each card pins below the nav while the next one slides over it; the covered
 * card scales down and dims a little so the stack reads as depth. Scroll-linked, transform-only,
 * driven by one useScroll on the section. Below `md` the cards simply flow.
 */
export function ProjectStack({ projects, fetchedAt }: Props) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const check = () => setWide(mq.matches);
    check();
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const n = projects.length;
  return (
    <ol ref={ref} className="stack" role="list">
      {projects.map((p, i) => (
        <Card key={p.slug} project={p} index={i} n={n} progress={scrollYProgress} fetchedAt={fetchedAt} animate={wide && !reduce} />
      ))}
    </ol>
  );
}

function Card({ project: p, index: i, n, progress, fetchedAt, animate }: { project: StackProject; index: number; n: number; progress: MotionValue<number>; fetchedAt: string; animate: boolean }) {
  // Card i starts shrinking once card i+1 begins to cover it.
  const start = i / n;
  const targetScale = 1 - (n - 1 - i) * 0.045;
  const scaleMv = useTransform(progress, [start, 1], [1, targetScale]);
  // A bg-coloured veil fades in over the covered card (cards stay opaque, so nothing bleeds through).
  const veilMv = useTransform(progress, [start, Math.min(1, start + 1 / n), 1], [0, 0.35, 0.6]);
  const href = `/work/${p.slug}/`;
  const scale = animate ? scaleMv : 1;
  const veil = animate && i < n - 1 ? veilMv : 0;

  return (
    <li className="stack-item" style={animate ? { top: 0 } : undefined}>
      <motion.article className="stack-card" style={{ scale }} aria-labelledby={`stack-${p.slug}`}>
        <motion.span className="stack-veil" style={{ opacity: veil }} aria-hidden />
        <div className="stack-copy order-2 flex flex-col justify-between gap-8 p-6 lg:order-1 lg:p-9 xl:p-11">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="text-accent">{String(i + 1).padStart(2, '0')}</span>
              <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
              {CATEGORY_LABEL[p.category]}
            </p>
            <h3 id={`stack-${p.slug}`} className="mt-5 font-display text-[clamp(2rem,1.4rem+2.2vw,3.5rem)] leading-[0.98] tracking-tight">
              <TransitionLink href={href} className="link-underline" label={p.title}>
                {p.title}
              </TransitionLink>
            </h3>
            <p className="stack-tagline mt-4 max-w-[38ch] text-muted">{p.tagline}</p>
            <dl className="mt-7 grid grid-cols-2 gap-5">
              {p.results.slice(0, 2).map((m) => (
                <div key={m.label} className="flex flex-col border-l border-border pl-4">
                  <dt className="order-2 mt-1 text-xs leading-snug text-muted">{m.label}</dt>
                  <dd className="order-1 num font-display text-2xl leading-none xl:text-3xl">{m.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-7 hidden max-w-[42ch] text-sm leading-relaxed text-muted xl:block [@media(max-height:780px)]:hidden">{p.summary}</p>
          </div>
          <div>
            <ul className="flex flex-wrap gap-2" role="list" aria-label="Stack">
              {p.stack.slice(0, 5).map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <TransitionLink href={href} className="link-underline font-medium" label={p.title} data-track={`stack-case-${p.slug}`}>
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
          </div>
        </div>
        <TransitionLink href={href} className="stack-media group order-1 block lg:order-2 lg:border-l lg:border-border" data-cursor="view" label={p.title}>
          <span className="sr-only">Open case study: {p.title}</span>
          <motion.div className="h-full w-full" whileHover={animate ? { scale: 1.03 } : undefined} transition={{ type: 'spring', stiffness: 160, damping: 26 }}>
            {p.image ? (
              <Picture base={p.image} alt={`${p.title} — screenshot of the live product`} priority={i === 0} sizes="(min-width: 1024px) 58vw, 100vw" className="h-full w-full" />
            ) : p.diagram ? (
              <SystemDiagram diagram={p.diagram} title={p.title} variant="vertical" />
            ) : null}
          </motion.div>
        </TransitionLink>
      </motion.article>
    </li>
  );
}
