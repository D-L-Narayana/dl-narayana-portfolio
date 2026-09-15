import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Magnetic } from '@/components/ui/Magnetic';
import { Picture } from '@/components/ui/Picture';
import { Reveal } from '@/components/ui/Reveal';
import { SystemDiagram } from '@/components/ui/SystemDiagram';
import { ChapterNav } from '@/components/work/ChapterNav';
import { CountUp } from '@/components/work/CountUp';
import { NextProject } from '@/components/work/NextProject';
import { site } from '@/data/content';
import { notes } from '@/data/notes';
import { CATEGORY_LABEL } from '@/data/projects';
import { allProjects, projectBySlug, stats } from '@/lib/github';
import { formatDate, relative } from '@/lib/format';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return allProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return { title: 'Not found' };
  return {
    title: `${p.title} — ${CATEGORY_LABEL[p.category]}`,
    description: p.tagline,
    alternates: { canonical: `/work/${p.slug}/` },
    openGraph: { title: `${p.title} — D L Narayana`, description: p.tagline, url: `/work/${p.slug}/`, type: 'article' },
    twitter: { card: 'summary_large_image' },
  };
}

const CHAPTERS = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem' },
  { id: 'approach', label: 'Approach' },
  { id: 'results', label: 'Results' },
  { id: 'stack', label: 'Stack' },
];

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();
  const i = allProjects.findIndex((x) => x.slug === p.slug);
  const prev = allProjects[(i - 1 + allProjects.length) % allProjects.length];
  const next = allProjects[(i + 1) % allProjects.length];
  const related = notes.filter((n) => n.project === p.slug);
  const isDiagram = !p.image && !!p.diagram;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: p.title,
    description: p.tagline,
    codeRepository: p.repoUrl,
    programmingLanguage: p.language ?? undefined,
    author: { '@type': 'Person', name: site.name, url: site.url },
    dateCreated: p.createdAt ?? undefined,
    dateModified: p.pushedAt ?? undefined,
    url: p.liveUrl ?? p.repoUrl,
    keywords: p.stack.join(', '),
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Work', item: `${site.url}/work/` },
      { '@type': 'ListItem', position: 3, name: p.title, item: `${site.url}/work/${p.slug}/` },
    ],
  };

  return (
    <article className="pt-32 md:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <header className="shell" id="overview">
        <div className="hairline pt-8 md:pt-10">
          {/* CSS-animated (not Motion) so the LCP text never waits for hydration */}
          <div className="fade-rise" style={{ '--d': '40ms' } as CSSProperties}>
            <p className="eyebrow mb-6 flex flex-wrap items-center gap-3">
              <TransitionLink href="/work/" className="link-underline text-muted hover:text-text" label="Work">
                Work
              </TransitionLink>
              <span aria-hidden>/</span>
              <span className="text-accent">{String(i + 1).padStart(2, '0')}</span>
              <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
              {CATEGORY_LABEL[p.category]}
            </p>
            <h1 className="display">{p.title}</h1>
            <p className="lead mt-8 max-w-[40em]">{p.tagline}</p>
          </div>
          <div className="fade-rise mt-10 grid gap-x-8 gap-y-6 md:grid-cols-12" style={{ '--d': '160ms' } as CSSProperties}>
            <dl className="grid grid-cols-2 gap-6 text-sm md:col-span-8 md:grid-cols-4">
              <Meta k="Role" v="Solo — design, engineering, deployment" />
              <Meta k="Language" v={p.languageShare.length ? p.languageShare.map((l) => `${l.name} ${l.pct}%`).slice(0, 2).join(' · ') : (p.language ?? '—')} />
              <Meta k="Timeline" v={`${formatDate(p.createdAt, { day: false })} → ${formatDate(p.pushedAt, { day: false })}`} />
              <Meta k="Last push" v={`${relative(p.pushedAt, stats.fetchedAt)} · ${p.commits} commits`} />
            </dl>
            <div className="flex flex-wrap items-start gap-3 md:col-span-4 md:justify-end">
              {p.liveUrl && (
                <Magnetic>
                  <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary" data-track={`live-${p.slug}`}>
                    Live demo <span className="arrow" aria-hidden>↗</span>
                  </a>
                </Magnetic>
              )}
              <Magnetic>
                <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost" data-track={`source-${p.slug}`}>
                  Source <span className="arrow" aria-hidden>↗</span>
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </header>

      <div className="shell mt-12 md:mt-16">
        <div data-reveal="clip" className={`media ${isDiagram ? 'aspect-[16/10] md:aspect-[21/10]' : 'aspect-[16/10]'}`}>
          {p.image ? <Picture base={p.image} alt={`${p.title} — screenshot of the live product`} priority sizes="(min-width: 1360px) 1360px, 100vw" className="h-full w-full" /> : p.diagram ? <SystemDiagram diagram={p.diagram} title={p.title} ratio={21 / 10} /> : null}
        </div>
      </div>

      {/* At a glance — the results as a ledger strip */}
      <div className="shell mt-10 md:mt-14">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4" aria-label="At a glance">
          {p.results.slice(0, 4).map((m, k) => (
            <div key={m.label} data-reveal style={{ '--i': k } as CSSProperties} className="flex flex-col bg-surface p-5 md:p-7">
              <dt className="order-2 mt-2 text-sm text-muted">{m.label}</dt>
              <dd className="order-1 num font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] leading-none">
                <CountUp value={m.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="shell mt-16 grid gap-12 md:mt-24 md:grid-cols-12">
        <aside className="hidden md:col-span-3 md:block">
          <ChapterNav items={CHAPTERS} />
        </aside>
        <div className="md:col-span-8 md:col-start-5">
          <Reveal>
            <p className="prose text-lg leading-relaxed text-text">{p.summary}</p>
          </Reveal>
          <Reveal className="mt-14" as="section" id="problem">
            <h2 className="eyebrow mb-5">Problem</h2>
            <p className="prose text-lg leading-relaxed text-text">{p.problem}</p>
          </Reveal>
          <Reveal className="mt-14" as="section" id="approach">
            <h2 className="eyebrow mb-5">Approach</h2>
            <ol className="prose grid gap-6" role="list">
              {p.approach.map((a, k) => (
                <li key={k} className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-border pt-5">
                  <span className="mono pt-1 text-xs text-accent">0{k + 1}</span>
                  <p>{a}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal className="mt-14" as="section" id="results">
            <h2 className="eyebrow mb-5">Results</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {p.results.map((m, k) => (
                <div key={m.label} data-reveal style={{ '--i': k } as CSSProperties} className="flex flex-col border-l border-border pl-4">
                  <dt className="order-2 mt-1 text-sm text-muted">{m.label}</dt>
                  <dd className="order-1 num font-display text-3xl leading-none">{m.value}</dd>
                </div>
              ))}
            </dl>
            {p.repo && (
              <dl className="mono mt-8 grid grid-cols-2 gap-y-3 border-t border-border pt-5 text-xs text-muted sm:grid-cols-4">
                <div>
                  <dt className="text-faint">Created</dt>
                  <dd>{formatDate(p.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-faint">Commits</dt>
                  <dd>{p.commits}</dd>
                </div>
                <div>
                  <dt className="text-faint">Default branch</dt>
                  <dd>{p.repo.default_branch}</dd>
                </div>
                <div>
                  <dt className="text-faint">License</dt>
                  <dd>{p.repo.license ?? 'unlicensed'}</dd>
                </div>
              </dl>
            )}
          </Reveal>
          <Reveal className="mt-14" as="section" id="stack">
            <h2 className="eyebrow mb-5">Stack</h2>
            <ul className="flex flex-wrap gap-2" role="list">
              {p.stack.map((s) => (
                <li key={s} className="chip !text-text">
                  {s}
                </li>
              ))}
            </ul>
            {p.repo?.topics?.length ? <p className="mono mt-6 text-sm text-muted">{p.repo.topics.map((t) => `#${t}`).join('  ')}</p> : null}
          </Reveal>
          {related.length > 0 && (
            <Reveal className="mt-14" as="section">
              <h2 className="eyebrow mb-5">From the notes</h2>
              <ul className="grid gap-3" role="list">
                {related.map((n) => (
                  <li key={n.slug}>
                    <TransitionLink href={`/notes/${n.slug}/`} className="card group flex items-start justify-between gap-6 p-5" label={n.title}>
                      <span>
                        <span className="block font-display text-xl leading-tight">{n.title}</span>
                        <span className="mt-2 block text-sm text-muted">{n.dek}</span>
                      </span>
                      <span className="arrow mt-1 text-muted transition-transform group-hover:translate-x-1" aria-hidden>
                        →
                      </span>
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </div>

      <NextProject project={next} prev={prev} />
    </article>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="eyebrow">{k}</dt>
      <dd className="mt-2 text-text">{v}</dd>
    </div>
  );
}
