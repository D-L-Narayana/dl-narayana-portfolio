'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Item, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { timeline } from '@/data/content';
import { monthYear } from '@/lib/format';

export function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section id="timeline" className="section" aria-labelledby="timeline-title">
      <div className="container">
        <SectionHeader
          index="05"
          eyebrow="Timeline"
          title={
            <span id="timeline-title">
              A short record, <em>densely</em> written.
            </span>
          }
          aside={<p className="text-muted">Dates come from repository creation and push timestamps, not memory.</p>}
        />
        <div className="relative md:grid md:grid-cols-12">
          <RevealGroup as="div" className="relative md:col-span-10 md:col-start-2" gap={0.08}>
            <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-border md:left-[calc(25%-1px)]" />
            <motion.span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px origin-top bg-accent md:left-[calc(25%-1px)]" style={{ scaleY }} />
            <ol ref={ref} role="list">
              {timeline.map((t) => (
                <Item key={t.title} as="li" className="relative grid gap-2 pb-12 pl-8 md:grid-cols-4 md:gap-8 md:pl-0">
                  <span aria-hidden className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-accent bg-bg md:left-[calc(25%-8px)]" />
                  <p className="eyebrow md:pr-10 md:text-right">{/^\d{4}-\d{2}$/.test(t.date) ? monthYear(t.date) : t.date}</p>
                  <div className="md:col-span-3 md:pl-10">
                    <h3 className="font-display text-xl md:text-2xl">
                      {t.href ? (
                        t.href.startsWith('/') ? (
                          <TransitionLink href={t.href} className="link-underline">
                            {t.title}
                          </TransitionLink>
                        ) : (
                          <a href={t.href} className="link-underline" target="_blank" rel="noreferrer">
                            {t.title} ↗
                          </a>
                        )
                      ) : (
                        t.title
                      )}
                    </h3>
                    <p className="mt-2 max-w-[60ch] text-muted">{t.body}</p>
                  </div>
                </Item>
              ))}
            </ol>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
