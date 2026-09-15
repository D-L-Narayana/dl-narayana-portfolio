import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { NoteBody, slugify } from '@/components/notes/NoteBody';
import { NoteCover } from '@/components/notes/NoteCover';
import { TransitionLink } from '@/components/providers/Transition';
import { ChapterNav } from '@/components/work/ChapterNav';
import { Magnetic } from '@/components/ui/Magnetic';
import { Reveal } from '@/components/ui/Reveal';
import { getNote, notes, readingMinutes } from '@/data/notes';
import { site } from '@/data/content';
import { projectBySlug } from '@/lib/github';
import { formatDate } from '@/lib/format';

type Params = { slug: string };
export function generateStaticParams(): Params[] {
  return notes.map((n) => ({ slug: n.slug }));
}
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const n = getNote(slug);
  if (!n) return { title: 'Not found' };
  return {
    title: n.title,
    description: n.dek,
    alternates: { canonical: `/notes/${n.slug}/` },
    openGraph: { title: `${n.title} — D L Narayana`, description: n.dek, url: `/notes/${n.slug}/`, type: 'article', publishedTime: n.date, authors: [site.name] },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function NotePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const n = getNote(slug);
  if (!n) notFound();
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));
  const i = sorted.findIndex((x) => x.slug === n.slug);
  const prev = sorted[(i - 1 + sorted.length) % sorted.length];
  const next = sorted[(i + 1) % sorted.length];
  const p = projectBySlug(n.project);
  const chapters = n.blocks.filter((b) => b.t === 'h2').map((b) => ({ id: slugify((b as { text: string }).text), label: (b as { text: string }).text }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: n.title,
    description: n.dek,
    datePublished: n.date,
    author: { '@type': 'Person', name: site.name, url: site.url },
    url: `${site.url}/notes/${n.slug}/`,
    keywords: n.tags.join(', '),
    about: p ? { '@type': 'SoftwareSourceCode', name: p.title, codeRepository: p.repoUrl } : undefined,
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Notes', item: `${site.url}/notes/` },
      { '@type': 'ListItem', position: 3, name: n.title, item: `${site.url}/notes/${n.slug}/` },
    ],
  };

  return (
    <article className="pt-32 md:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <header className="shell">
        <div className="hairline pt-8 md:pt-10">
          <div className="fade-rise" style={{ '--d': '40ms' } as CSSProperties}>
            <p className="eyebrow mb-6 flex flex-wrap items-center gap-3">
              <TransitionLink href="/notes/" className="link-underline text-muted hover:text-text" label="Notes">
                Notes
              </TransitionLink>
              <span aria-hidden>/</span>
              <span className="text-accent">{String(i + 1).padStart(2, '0')}</span>
              <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
              <time dateTime={n.date}>{formatDate(n.date)}</time>
              <span aria-hidden>·</span>
              <span>{readingMinutes(n)} min read</span>
            </p>
            <h1 className="display max-w-[16ch] !text-[clamp(2.5rem,1.4rem+4.6vw,6rem)]">{n.title}</h1>
            <p className="lead mt-8 max-w-[44em]">{n.dek}</p>
          </div>
        </div>
      </header>

      <Reveal className="shell mt-12 md:mt-16">
        <div className="media aspect-[21/9]">
          <NoteCover seed={n.seed} title={n.title} className="h-full w-full" />
        </div>
      </Reveal>

      <div className="shell mt-14 grid gap-12 md:mt-20 md:grid-cols-12">
        <aside className="hidden md:col-span-3 md:block">
          <div className="chapter-nav">
          <ChapterNav items={[{ id: 'top', label: 'Overview' }, ...chapters]} />
          {p && (
            <div className="mt-10">
              <p className="eyebrow mb-3">From the project</p>
              <TransitionLink href={`/work/${p.slug}/`} className="link-underline font-medium" label={p.title}>
                {p.title} →
              </TransitionLink>
              <p className="mt-2 text-sm text-muted">{p.tagline}</p>
            </div>
          )}
          </div>
        </aside>
        <div className="md:col-span-8 md:col-start-5" id="top">
          <NoteBody blocks={n.blocks} />
          <ul className="mt-10 flex flex-wrap gap-2" role="list" aria-label="Tags">
            {n.tags.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
          {p && (
            <div className="card mt-12 grid gap-6 p-6 md:grid-cols-12 md:items-center md:p-8">
              <div className="md:col-span-8">
                <p className="eyebrow">Case study</p>
                <p className="mt-2 font-display text-2xl">{p.title}</p>
                <p className="mt-2 text-sm text-muted">{p.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-4 md:justify-end">
                <Magnetic>
                  <TransitionLink href={`/work/${p.slug}/`} className="btn btn-primary" label={p.title}>
                    Open <span className="arrow" aria-hidden>→</span>
                  </TransitionLink>
                </Magnetic>
                <Magnetic>
                  <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                    Code <span className="arrow" aria-hidden>↗</span>
                  </a>
                </Magnetic>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="shell mt-24 md:mt-32" aria-label="Adjacent notes">
        <div className="hairline grid gap-6 pt-6 sm:grid-cols-2">
          <TransitionLink href={`/notes/${prev.slug}/`} className="group" label={prev.title}>
            <span className="eyebrow">← Previous</span>
            <span className="link-underline mt-2 block font-display text-2xl">{prev.title}</span>
          </TransitionLink>
          <TransitionLink href={`/notes/${next.slug}/`} className="group sm:text-right" label={next.title}>
            <span className="eyebrow">Next →</span>
            <span className="link-underline mt-2 block font-display text-2xl">{next.title}</span>
          </TransitionLink>
        </div>
      </nav>
    </article>
  );
}
