import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { NoteCover } from '@/components/notes/NoteCover';
import { TransitionLink } from '@/components/providers/Transition';
import { notes, readingMinutes } from '@/data/notes';
import { projectBySlug } from '@/lib/github';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Engineering notes by D L Narayana — streaming lakehouses, data-quality gates, quantisation trade-offs, agents with human-in-the-loop gates and ML in the browser.',
  alternates: { canonical: '/notes/', types: { 'application/rss+xml': '/feed.xml' } },
  openGraph: { title: 'Notes — D L Narayana', url: '/notes/' },
};

export default function NotesPage() {
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="shell section pt-32 md:pt-40">
      <div className="hairline pt-8 md:pt-10">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="text-accent">{notes.length}</span>
          <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
          engineering notes
          <a href="/feed.xml" className="link-underline ml-auto normal-case tracking-normal text-muted hover:text-text">
            RSS ↗
          </a>
        </p>
        <h1 className="display serif-em">
          Notes from the <em>build log</em>.
        </h1>
        <p className="lead mt-8">Short write-ups distilled from the project READMEs: the decision that mattered, the number that proved it, and the pattern worth reusing.</p>
      </div>
      <ol className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="list">
        {sorted.map((n, i) => {
          const p = projectBySlug(n.project);
          return (
            <li key={n.slug} data-reveal style={{ '--i': i } as CSSProperties} className="card group flex flex-col overflow-hidden">
              <TransitionLink href={`/notes/${n.slug}/`} className="media !rounded-none !border-0 !border-b !border-border aspect-[16/10] overflow-hidden" data-cursor="view" label={n.title} aria-label={n.title}>
                <NoteCover seed={n.seed} title={n.title} className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              </TransitionLink>
              <div className="flex flex-1 flex-col p-6">
                <p className="eyebrow flex justify-between gap-3">
                  <span>{p?.title ?? 'Note'}</span>
                  <span className="normal-case tracking-normal text-faint">{readingMinutes(n)} min read</span>
                </p>
                <h2 className="mt-3 font-display text-2xl leading-tight">
                  <TransitionLink href={`/notes/${n.slug}/`} className="link-underline" label={n.title}>
                    {n.title}
                  </TransitionLink>
                </h2>
                <p className="mt-3 text-sm text-muted">{n.dek}</p>
                <p className="mono mt-auto pt-5 text-xs text-faint">
                  <time dateTime={n.date}>{formatDate(n.date, { day: false })}</time> · {n.tags.join(' · ')}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
