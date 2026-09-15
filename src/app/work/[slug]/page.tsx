import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TransitionLink } from '@/components/providers/Transition';
import { Magnetic } from '@/components/ui/Magnetic';
import { Picture } from '@/components/ui/Picture';
import { Item, Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SystemDiagram } from '@/components/ui/SystemDiagram';
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

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();
  const i = allProjects.findIndex((x) => x.slug === p.slug);
  const prev = allProjects[(i - 1 + allProjects.length) % allProjects.length];
  const next = allProjects[(i + 1) % allProjects.length];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: p.title,
    description: p.tagline,
    codeRepository: p.repoUrl,
    programmingLanguage: p.language ?? undefined,
    author: { '@type': 'Person', name: 'D L Narayana' },
    dateModified: p.pushedAt ?? undefined,
    url: p.liveUrl ?? p.repoUrl,
  };

  return (
    <article className="pt-32 md:pt-40">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="container">
        <div className="hairline pt-8 md:pt-10">
          <Reveal>
            <p className="eyebrow mb-6 flex flex-wrap items-center gap-3">
              <TransitionLink href="/work/" className="link-underline text-muted hover:text-text">
                Work
              </TransitionLink>
              <span aria-hidden>/</span>
              <span className="text-accent">{String(i + 1).padStart(2, '0')}</span>
              <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
              {CATEGORY_LABEL[p.category]}
            </p>
            <h1 className="display">{p.title}</h1>
            <p className="lead mt-8 max-w-[40em]">{p.tagline}</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 grid gap-x-8 gap-y-6 md:grid-cols-12">
            <dl className="grid grid-cols-2 gap-6 text-sm md:col-span-8 md:grid-cols-4">
              <Meta k="Role" v="Solo — design, engineering, deployment" />
              <Meta k="Language" v={p.languageShare.length ? p.languageShare.map((l) => `${l.name} ${l.pct}%`).slice(0, 2).join(' · ') : (p.language ?? '—')} />
              <Meta k="Timeline" v={`${formatDate(p.createdAt, { day: false })} → ${formatDate(p.pushedAt, { day: false })}`} />
              <Meta k="Last push" v={`${relative(p.pushedAt, stats.fetchedAt)} · ${p.commits} commits`} />
            </dl>
            <div className="flex flex-wrap items-start gap-3 md:col-span-4 md:justify-end">
              {p.liveUrl && (
                <Magnetic>
                  <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                    Live demo <span className="arrow" aria-hidden>↗</span>
                  </a>
                </Magnetic>
              )}
              <Magnetic>
                <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  Source <span className="arrow" aria-hidden>↗</span>
                </a>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </header>

      <Reveal className="container mt-12 md:mt-16">
        <div className="media aspect-[16/10]">
          {p.image ? <Picture base={p.image} alt={`${p.title} — screenshot of the live product`} priority sizes="(min-width: 1280px) 1280px, 100vw" className="h-full w-full" /> : p.diagram ? <SystemDiagram diagram={p.diagram} title={p.title} /> : null}
        </div>
      </Reveal>

      <div className="container mt-16 grid gap-16 md:mt-24 md:grid-cols-12">
        <div className="md:col-span-7">
          <Reveal>
            <h2 className="eyebrow mb-5">Problem</h2>
            <p className="prose text-lg leading-relaxed text-text">{p.problem}</p>
          </Reveal>
          <Reveal className="mt-14">
            <h2 className="eyebrow mb-5">Approach</h2>
            <ol className="prose grid gap-5" role="list">
              {p.approach.map((a, k) => (
                <li key={k} className="grid grid-cols-[2.25rem_1fr] gap-3">
                  <span className="mono pt-1 text-xs text-accent">0{k + 1}</span>
                  <p>{a}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
        <aside className="md:col-span-4 md:col-start-9">
          <Reveal>
            <h2 className="eyebrow mb-5">Results</h2>
            <RevealGroup as="dl" className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {p.results.map((m) => (
                <Item key={m.label} className="bg-surface p-5">
                  <dd className="tabular font-display text-3xl leading-none">{m.value}</dd>
                  <dt className="mt-2 text-sm text-muted">{m.label}</dt>
                </Item>
              ))}
            </RevealGroup>
          </Reveal>
          <Reveal className="mt-12">
            <h2 className="eyebrow mb-5">Stack</h2>
            <ul className="flex flex-wrap gap-2" role="list">
              {p.stack.map((s) => (
                <li key={s} className="chip !text-text">
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
          {p.repo?.topics?.length ? (
            <Reveal className="mt-12">
              <h2 className="eyebrow mb-5">GitHub topics</h2>
              <p className="mono text-sm text-muted">{p.repo.topics.map((t) => `#${t}`).join('  ')}</p>
            </Reveal>
          ) : null}
        </aside>
      </div>

      <nav className="container mt-24 md:mt-32" aria-label="Adjacent projects">
        <div className="hairline grid gap-6 pt-6 sm:grid-cols-2">
          <TransitionLink href={`/work/${prev.slug}/`} className="group">
            <span className="eyebrow">← Previous</span>
            <span className="link-underline mt-2 block font-display text-2xl">{prev.title}</span>
          </TransitionLink>
          <TransitionLink href={`/work/${next.slug}/`} className="group sm:text-right">
            <span className="eyebrow">Next →</span>
            <span className="link-underline mt-2 block font-display text-2xl">{next.title}</span>
          </TransitionLink>
        </div>
      </nav>
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
