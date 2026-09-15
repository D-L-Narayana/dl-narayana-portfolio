'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type CSSProperties } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Magnetic } from '@/components/ui/Magnetic';
import { site } from '@/data/content';
import { formatDate, nf } from '@/lib/format';
import { GATES, GATE_LABELS, HeroField } from './HeroField';

type Stats = { publicRepos: number; commits: number; liveDemos: number; lastPush: string | null; fetchedAt: string };

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

/** First viewport: the event field runs full-bleed behind the headline; gates are DOM hairlines so
 *  they stay crisp at any DPR; the copy parallaxes and fades as the reader leaves. */
export function Hero({ stats }: { stats: Stats }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const fieldY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col" aria-labelledby="hero-title">
      <motion.div className="hero-field fade-rise -z-10" style={{ y: fieldY, '--d': '300ms' } as never} aria-hidden="true">
        <HeroField className="absolute inset-0" />
        {GATES.map((g, i) => (
          <span key={g} className="gate" data-gold={i === 2 ? '' : undefined} style={{ left: `${g * 100}%` }}>
            <span className={`gate-label eyebrow ${i === 2 ? 'text-accent' : ''}`}>
              {String(i + 1).padStart(2, '0')} {GATE_LABELS[i]}
            </span>
          </span>
        ))}
      </motion.div>

      <motion.div className="shell relative flex flex-1 flex-col justify-end pt-36 md:pt-40" style={{ y, opacity }}>
        <p className="eyebrow fade-rise mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 md:mb-8" style={{ '--d': '40ms' } as CSSProperties}>
          <span className="inline-flex items-center gap-3">
            <span className="text-accent" aria-hidden>
              ●
            </span>
            <span>{site.roles.join(' · ')}</span>
          </span>
          <span aria-hidden className="hidden h-px w-6 bg-border-strong sm:inline-block" />
          <span>{site.location}</span>
        </p>
        <h1 id="hero-title" className="display !text-[length:var(--fs-display)] !leading-[0.92]" aria-label="Pipelines that hold. Products that ship.">
          <span aria-hidden>
            <Words words={line1} base={0.1} />
            <Words words={line2} base={0.28} />
          </span>
        </h1>
        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-12 md:items-end">
          <p className="lead fade-rise md:col-span-7 lg:col-span-6" style={{ '--d': '520ms' } as CSSProperties}>
            I&rsquo;m D L Narayana — a data engineer and full-stack developer building real-time CDC lakehouses, PySpark warehouses and AI-first web products. {site.education}.
          </p>
          <div className="fade-rise flex flex-wrap items-center gap-3 md:col-span-5 md:justify-end lg:col-span-6" style={{ '--d': '660ms' } as CSSProperties}>
            <Magnetic>
              <a href="#work" className="btn btn-primary" data-track="hero-cta-work">
                Selected work
                <span className="arrow" aria-hidden>
                  ↓
                </span>
              </a>
            </Magnetic>
            <Magnetic>
              <TransitionLink href="/notes/" className="btn btn-ghost" data-track="hero-cta-notes">
                Engineering notes
              </TransitionLink>
            </Magnetic>
            <Magnetic>
              <a href={site.github} target="_blank" rel="noreferrer" className="btn btn-ghost" data-track="hero-cta-github">
                GitHub
                <span className="arrow" aria-hidden>
                  ↗
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </motion.div>

      <div className="shell relative mt-12 md:mt-16">
        <div className="hairline fade-rise grid grid-cols-2 gap-y-6 py-6 md:grid-cols-5 md:py-7" style={{ '--d': '900ms' } as CSSProperties}>
          <dl className="contents">
            <Stat label="Public repositories" value={String(stats.publicRepos)} />
            <Stat label="Commits, public repos" value={nf.format(stats.commits)} />
            <Stat label="Live deployments" value={String(stats.liveDemos)} />
            <Stat label="Last push" value={formatDate(stats.lastPush)} />
          </dl>
          <div className="col-span-2 flex items-end justify-between md:col-span-1 md:block md:text-right" aria-hidden="true">
            <span className="eyebrow md:hidden">Snapshot {formatDate(stats.fetchedAt)}</span>
            <span className="scroll-cue eyebrow md:justify-end">Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="num mt-2 font-display text-2xl sm:text-3xl md:text-4xl">{value}</dd>
    </div>
  );
}
