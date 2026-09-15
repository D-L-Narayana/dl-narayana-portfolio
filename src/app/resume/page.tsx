import type { Metadata } from 'next';
import { Magnetic } from '@/components/ui/Magnetic';
import { PrintButton } from '@/components/ui/PrintButton';
import { site, stackGroups } from '@/data/content';
import { CATEGORY_LABEL } from '@/data/projects';
import { featured, stats } from '@/lib/github';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Résumé',
  description: 'One-page résumé of D L Narayana — data engineer, full-stack and AI product developer. B.Tech CSE, GITAM, Class of 2027.',
  alternates: { canonical: '/resume/' },
  openGraph: { title: 'Résumé — D L Narayana', url: '/resume/' },
};

/** The résumé is a real page (indexable, printable) and the PDF in /public is printed from it by
 *  scripts/resume-pdf.mjs, so the two can never disagree. Only facts from the data files appear. */
export default function ResumePage() {
  const groups = stackGroups.filter((g) => g.name !== 'Exploring');
  const exploring = stackGroups.find((g) => g.name === 'Exploring')?.items ?? [];
  return (
    <section className="shell section pt-32 md:pt-40 print:pt-0">
      <div className="resume">
        <div className="hairline flex flex-col gap-6 pt-8 md:flex-row md:items-end md:justify-between md:pt-10 print:border-0 print:pt-0">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-3">
              <span className="text-accent">CV</span>
              <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
              {site.roles.join(' · ')}
            </p>
            <h1 className="display !text-[clamp(2.5rem,1.4rem+4vw,5rem)]">{site.name}</h1>
            <p className="mt-4 text-muted">
              {site.location} · <a href={`mailto:${site.email}`} className="link-underline text-text">{site.email}</a> · <a href={site.github} className="link-underline text-text" target="_blank" rel="noreferrer">github.com/D-L-Narayana</a> · <a href={site.linkedin} className="link-underline text-text" target="_blank" rel="noreferrer">linkedin.com/in/dlnarayana</a>
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-3">
            <Magnetic>
              <a href={site.resumePdf} download className="btn btn-primary" data-track="resume-pdf">
                Download PDF <span className="arrow" aria-hidden>↓</span>
              </a>
            </Magnetic>
            <PrintButton />
          </div>
        </div>

        <div className="resume-body mt-12 grid gap-12 md:grid-cols-12">
          <div className="resume-main md:col-span-8">
            <h2 className="resume-h mb-4">Profile</h2>
            <p className="text-text">
              Computer-science student building production-shaped systems: real-time CDC lakehouses and PySpark warehouses with explicit schemas, data-quality gates and idempotent, tested transforms; full-stack products on Next.js, TypeScript and PostgreSQL; and AI features — LangGraph agents with human-in-the-loop safety gates, hybrid RAG, and on-device ONNX/WASM inference. {stats.publicRepos} public repositories, {stats.liveDemos} live deployments.
            </p>

            <h2 className="resume-h mb-4 mt-10 print:mt-7">Selected projects</h2>
            <ol className="grid gap-5 print:gap-4" role="list">
              {featured.map((p) => (
                <li key={p.slug} className="card p-5 print:rounded-lg print:p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-sans text-base font-semibold tracking-normal">
                      {p.title} <span className="font-normal text-muted">— {CATEGORY_LABEL[p.category]}</span>
                    </h3>
                    <span className="mono text-xs text-faint">
                      {formatDate(p.createdAt, { day: false })} · {p.repoUrl.replace('https://', '')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{p.tagline}</p>
                  <ul className="mt-3 grid gap-1 text-sm text-text sm:grid-cols-2 print:grid-cols-2" role="list">
                    {p.results.slice(0, 4).map((r) => (
                      <li key={r.label}>
                        <span className="num font-medium">{r.value}</span> <span className="text-muted">{r.label}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mono mt-3 text-xs text-faint">{p.stack.join(' · ')}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="resume-aside md:col-span-4">
            <h2 className="resume-h mb-4">Education</h2>
            <p className="font-medium text-text">B.Tech, Computer Science &amp; Engineering</p>
            <p className="text-sm text-muted">GITAM, Visakhapatnam · Class of 2027 · CGPA {site.cgpa}</p>

            <h2 className="resume-h mb-4 mt-10 print:mt-7">Skills</h2>
            <dl className="grid gap-4">
              {groups.map((g) => (
                <div key={g.name}>
                  <dt className="text-sm font-medium text-text">{g.name}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{g.items.join(', ')}</dd>
                </div>
              ))}
              <div>
                <dt className="text-sm font-medium text-text">Exploring</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">{exploring.join(', ')}</dd>
              </div>
            </dl>

            <h2 className="resume-h mb-4 mt-10 print:mt-7">Principles</h2>
            <p className="text-sm text-muted">Idempotent pipelines · explicit schemas · tests for every transform · metrics for every run.</p>

            <h2 className="resume-h mb-4 mt-10 print:mt-7">Public record</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-faint">Public repos</dt>
                <dd className="num text-text">{stats.publicRepos}</dd>
              </div>
              <div>
                <dt className="text-faint">Commits</dt>
                <dd className="num text-text">{stats.commits}</dd>
              </div>
              <div>
                <dt className="text-faint">Live deployments</dt>
                <dd className="num text-text">{stats.liveDemos}</dd>
              </div>
              <div>
                <dt className="text-faint">Snapshot</dt>
                <dd className="text-text">{formatDate(stats.fetchedAt)}</dd>
              </div>
            </dl>
          </aside>
        </div>
        <p className="mono mt-12 text-xs text-faint no-print">
          Full case studies at {site.url.replace('https://', '')}/work · Generated from the same data as the site on {formatDate(stats.fetchedAt)}.
        </p>
      </div>
    </section>
  );
}
