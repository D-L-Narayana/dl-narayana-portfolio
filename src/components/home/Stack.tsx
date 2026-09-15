import type { CSSProperties } from 'react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { stackGroups } from '@/data/content';
import { allProjects } from '@/lib/github';
import { buildMatrix } from '@/lib/matrix';
import { Marquee } from './Marquee';
import { SkillMatrix } from './SkillMatrix';

export function Stack({ index = '04' }: { index?: string }) {
  const all = stackGroups.flatMap((g) => g.items);
  const matrix = buildMatrix(allProjects, 18);
  return (
    <section id="stack" className="section" aria-labelledby="stack-title">
      <div className="shell">
        <SectionHeader
          index={index}
          eyebrow="Stack"
          title={
            <span id="stack-title">
              Tools chosen for <em>failure modes</em>, not logos.
            </span>
          }
          aside={<p className="text-muted">The ledger below is computed from every project&rsquo;s declared stack — each filled cell is a repository you can open. &ldquo;Exploring&rdquo; means reading and running locally, not yet shipping.</p>}
        />
        <div data-reveal>
          <SkillMatrix matrix={matrix} />
        </div>
        <div className="hairline mt-16">
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
