'use client';

import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle } from 'motion/react';
import { useRef, type CSSProperties } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Magnetic } from '@/components/ui/Magnetic';
import { site } from '@/data/content';
import { formatDate, nf } from '@/lib/format';
import { PipelineCanvas } from './PipelineCanvas';

type Stats = { publicRepos: number; commits: number; liveDemos: number; lastPush: string | null };

const line1 = ['Pipelines', 'that', '*hold.*'];
const line2 = ['Products', 'that', '*ship.*'];

function Words({ words, base }: { words: string[]; base: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      {words.map((word, i) => {
        const em = word.startsWith('*');
        const text = word.replace(/\*/g, '');
        return (
          <span key={i} className={`word-rise ${em ? 'italic font-normal text-accent' : ''}`} style={{ '--d': `${Math.round((base + i * 0.055) * 1000)}ms` } as CSSProperties}>
            {text}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        );
      })}
    </span>
  );
}

export function Hero({ stats }: { stats: Stats }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col justify-end pt-28 md:pt-32" aria-labelledby="hero-title">
      <motion.div className="container" style={{ y, opacity }}>
        <div>
          <p className="eyebrow fade-rise mb-6 flex flex-wrap items-center gap-x-3 gap-y-1" style={{ '--d': '40ms' } as CSSProperties}>
            <span className="inline-flex items-center gap-3">
              <span className="text-accent" aria-hidden>
                ●
              </span>
              <span>{site.roles.join(' · ')}</span>
            </span>
            <span aria-hidden className="hidden h-px w-6 bg-border-strong sm:inline-block" />
            <span>{site.location}</span>
          </p>
          <h1 id="hero-title" className="display" aria-label="Pipelines that hold. Products that ship.">
            <span aria-hidden>
              <Words words={line1} base={0.1} />
              <Words words={line2} base={0.28} />
            </span>
          </h1>
          <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:items-end">
            <p className="lead fade-rise md:col-span-7" style={{ '--d': '520ms' } as CSSProperties}>
              I&rsquo;m D L Narayana — a data engineer and full-stack developer building real-time CDC lakehouses, PySpark warehouses and AI-first web products. {site.education}.
            </p>
            <div className="fade-rise flex flex-wrap items-center gap-3 md:col-span-5 md:justify-end" style={{ '--d': '660ms' } as CSSProperties}>
              <Magnetic>
                <TransitionLink href="/work/" className="btn btn-primary">
                  Selected work
                  <span className="arrow" aria-hidden>
                    ↓
                  </span>
                </TransitionLink>
              </Magnetic>
              <Magnetic>
                <a href={site.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  GitHub
                  <span className="arrow" aria-hidden>
                    ↗
                  </span>
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="container fade-rise mt-12 md:mt-16" style={{ y: canvasY, '--d': '500ms' } as MotionStyle}>
        <PipelineCanvas className="h-[200px] sm:h-[240px] lg:h-[300px]" />
      </motion.div>

      <div className="container mt-8 md:mt-10">
        <dl className="hairline fade-rise grid grid-cols-2 gap-y-6 py-6 md:grid-cols-4" style={{ '--d': '900ms' } as CSSProperties}>
          <Stat label="Public repositories" value={String(stats.publicRepos)} />
          <Stat label="Commits on public repos" value={nf.format(stats.commits)} />
          <Stat label="Live deployments" value={String(stats.liveDemos)} />
          <Stat label="Last push" value={formatDate(stats.lastPush)} />
        </dl>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="tabular mt-2 font-display text-3xl md:text-4xl">{value}</dd>
    </div>
  );
}
