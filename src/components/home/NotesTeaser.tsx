import type { CSSProperties } from 'react';
import { NoteCover } from '@/components/notes/NoteCover';
import { TransitionLink } from '@/components/providers/Transition';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { notes, readingMinutes } from '@/data/notes';
import { projectBySlug } from '@/lib/github';

export function NotesTeaser({ index = '05' }: { index?: string }) {
  const latest = [...notes].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return (
    <section id="notes" className="section" aria-labelledby="notes-title">
      <div className="shell">
        <SectionHeader
          index={index}
          eyebrow="Notes"
          title={
            <span id="notes-title">
              Decisions, <em>written down</em>.
            </span>
          }
          aside={
            <p className="text-muted">
              Short engineering notes distilled from the project READMEs — the decision that mattered and the number that proved it.{' '}
              <TransitionLink href="/notes/" className="link-underline text-text" label="Notes">
                All {notes.length} notes →
              </TransitionLink>
            </p>
          }
        />
        <ol className="grid gap-6 md:grid-cols-3" role="list">
          {latest.map((n, i) => {
            const p = projectBySlug(n.project);
            return (
              <li key={n.slug} data-reveal style={{ '--i': i } as CSSProperties} className="card group flex flex-col overflow-hidden">
                <TransitionLink href={`/notes/${n.slug}/`} className="media !rounded-none !border-0 !border-b !border-border aspect-[16/9] overflow-hidden" data-cursor="view" label={n.title} aria-label={n.title}>
                  <NoteCover seed={n.seed} title={n.title} className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                </TransitionLink>
                <div className="flex flex-1 flex-col p-6">
                  <p className="eyebrow flex justify-between gap-3">
                    <span>{p?.title ?? 'Note'}</span>
                    <span className="normal-case tracking-normal text-faint">{readingMinutes(n)} min</span>
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-tight">
                    <TransitionLink href={`/notes/${n.slug}/`} className="link-underline" label={n.title}>
                      {n.title}
                    </TransitionLink>
                  </h3>
                  <p className="mt-3 text-sm text-muted">{n.dek}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
