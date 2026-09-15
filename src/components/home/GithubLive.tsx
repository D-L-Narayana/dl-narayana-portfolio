import { TransitionLink } from '@/components/providers/Transition';
import type { CSSProperties } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { github, languageBreakdown, showcaseRepos, stats } from '@/lib/github';
import { formatDate, nf, relative } from '@/lib/format';
import { ActivityBars, LanguageBar } from './GithubCharts';

export function GithubLive({ full = false }: { full?: boolean }) {
  const langs = languageBreakdown(0.5);
  const recent = [...showcaseRepos].sort((a, b) => b.pushed_at.localeCompare(a.pushed_at)).slice(0, full ? showcaseRepos.length : 6);

  return (
    <section id="github" className="section" aria-labelledby="github-title">
      <div className="container">
        <SectionHeader
          titleAs={full ? 'h1' : 'h2'}
          index={full ? '01' : '02'}
          eyebrow="GitHub, live"
          title={
            <span id="github-title">
              The public record, <em>unedited</em>.
            </span>
          }
          aside={
            <p className="text-muted">
              Built from the GitHub API at build time — public repositories only, bot commits excluded. Snapshot {formatDate(stats.fetchedAt)}.{' '}
              {!full && (
                <TransitionLink href="/github/" className="link-underline text-text">
                  Full table →
                </TransitionLink>
              )}
            </p>
          }
        />

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          <Tile i={0} label="Public repositories" value={String(stats.publicRepos)} note={`since ${formatDate(stats.memberSince, { day: false })}`} />
          <Tile i={1} label="Commits, public repos" value={nf.format(stats.commits)} note={`${formatDate(github.activity.firstCommit)} → ${formatDate(github.activity.lastCommit)}`} />
          <Tile i={2} label="Active weeks" value={`${stats.activeWeeks} / ${stats.weeks}`} note="last 26 weeks" />
          <Tile i={3} label="Languages" value={String(langs.length)} note={`${langs[0]?.name} leads at ${langs[0]?.pct.toFixed(0)} %`} />
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-7">
            <p className="eyebrow mb-6">Commit activity · 26 weeks · public repos</p>
            <ActivityBars weeks={github.activity.weeks} />
          </Reveal>
          <Reveal className="md:col-span-5" delay={0.1}>
            <p className="eyebrow mb-6">Language share · bytes across public repos</p>
            <LanguageBar langs={langs.map((l) => ({ name: l.name, pct: Math.round(l.pct * 10) / 10 }))} />
          </Reveal>
        </div>

        <div className="mt-16">
          <p className="eyebrow mb-4">{full ? 'All public repositories' : 'Recently pushed'}</p>
          <ul className="hairline" role="list">
            {recent.map((r, i) => (
              <li key={r.name} data-reveal style={{ '--i': Math.min(i, 8) } as CSSProperties} className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 border-b border-border py-4">
                <a href={r.html_url} target="_blank" rel="noreferrer" className="link-underline col-span-12 font-medium sm:col-span-4 md:col-span-3">
                  {r.name}
                </a>
                <p className="col-span-12 line-clamp-2 text-sm text-muted sm:col-span-8 md:col-span-6 md:pr-6">{r.description ? r.description.replace(/^[^A-Za-z0-9]+/, '') : 'Profile README'}</p>
                <span className="mono col-span-6 text-xs text-faint md:col-span-1">{r.language ?? '—'}</span>
                <span className="mono col-span-6 text-right text-xs text-faint md:col-span-2">
                  <time dateTime={r.pushed_at}>{relative(r.pushed_at, stats.fetchedAt)}</time>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Tile({ i, label, value, note }: { i: number; label: string; value: string; note?: string }) {
  return (
    <div data-reveal style={{ '--i': i } as CSSProperties} className="bg-surface p-6 md:p-8">
      <p className="eyebrow">{label}</p>
      <p className="tabular mt-4 font-display text-[clamp(2rem,1.5rem+2vw,3.25rem)] leading-none">{value}</p>
      {note && <p className="mono mt-3 text-xs text-faint">{note}</p>}
    </div>
  );
}
