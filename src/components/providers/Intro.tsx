'use client';

import { useEffect, useState } from 'react';
import { Monogram } from '@/components/ui/Wordmark';
import { site } from '@/data/content';

const TICKS = [
  { at: 0.3, label: 'Bronze' },
  { at: 0.55, label: 'Silver' },
  { at: 0.8, label: 'Gold' },
];

type Props = { repos: number; commits: number; snapshot: string };

/**
 * First-load sequence. The markup is server-rendered and every motion is a CSS animation, so it
 * paints with the first frame and lifts on its own even before React hydrates. The inline script in
 * layout.tsx decides whether it shows at all (`html.has-intro`): never under reduced motion, never
 * when the visitor arrived from another page of this site. React only tidies the node away.
 */
export function Intro({ repos, commits, snapshot }: Props) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('has-intro')) {
      setGone(true);
      return;
    }
    const id = window.setTimeout(() => {
      html.classList.add('intro-done');
      setGone(true);
    }, 1900);
    return () => window.clearTimeout(id);
  }, []);
  if (gone) return null;
  return (
    <div className="intro" aria-hidden="true">
      <div className="shell flex items-center justify-between pt-7">
        <span className="intro-in inline-flex items-center gap-3">
          <Monogram size={22} />
          <span className="font-display text-[1.15rem] leading-none tracking-tight">{site.name}</span>
        </span>
        <span className="intro-in eyebrow">Portfolio · 2026</span>
      </div>
      <div className="shell flex flex-col justify-center">
        <div className="intro-in mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <span className="eyebrow">Loading the public record</span>
          <span className="eyebrow num">
            {repos} repositories · {commits} commits · snapshot {snapshot}
          </span>
        </div>
        <div className="intro-rail">
          <i className="intro-bar" />
          {TICKS.map((t) => (
            <span key={t.label} className="intro-tick" style={{ left: `${t.at * 100}%`, '--t': `${Math.round(120 + t.at * 980)}ms` } as React.CSSProperties}>
              <span className="eyebrow absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap">{t.label}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="shell flex items-end justify-between gap-6 pb-7">
        <span className="intro-in eyebrow">{site.location}</span>
        <span className="intro-in eyebrow hidden text-right sm:block">Build things that matter. Ship things that work.</span>
      </div>
    </div>
  );
}
