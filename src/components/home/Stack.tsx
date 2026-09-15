import type { CSSProperties } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { stackGroups } from '@/data/content';
import { Marquee } from './Marquee';

export function Stack() {
  const all = stackGroups.flatMap((g) => g.items);
  return (
    <section id="stack" className="section" aria-labelledby="stack-title">
      <div className="container">
        <SectionHeader
          index="04"
          eyebrow="Stack"
          title={
            <span id="stack-title">
              Tools chosen for <em>failure modes</em>, not logos.
            </span>
          }
          aside={<p className="text-muted">Grouped the way the work is grouped. &ldquo;Exploring&rdquo; means reading, running locally and not yet shipping.</p>}
        />
        <div className="hairline">
          {stackGroups.map((g, i) => (
            <div key={g.name} data-reveal style={{ '--i': i } as CSSProperties} className="grid gap-4 border-b border-border py-6 md:grid-cols-12 md:gap-8">
              <h3 className="eyebrow md:col-span-2 md:pt-1">{g.name}</h3>
              <ul className="flex flex-wrap gap-2 md:col-span-10" role="list">
                {g.items.map((it) => (
                  <li key={it} className="chip !text-text">
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-16" aria-hidden="true">
        <Marquee items={all} />
      </div>
    </section>
  );
}
