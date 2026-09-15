'use client';

import { useState } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import type { Matrix } from '@/lib/matrix';
import { GROUP_LABEL } from '@/lib/matrix';

/**
 * Technology × project ledger. A real <table> (row and column headers, every cell meaningful to a
 * screen reader), with hover cross-highlighting handled by three data attributes — no per-cell state.
 * Filled cells link to the case study. Below `lg` the same data renders as a list of chips.
 */
export function SkillMatrix({ matrix }: { matrix: Matrix }) {
  const [hot, setHot] = useState<{ r: number; c: number } | null>(null);
  const { rows, cols } = matrix;
  const top = rows.slice(0, 3);
  const byGroup = (['data', 'web', 'ai', 'tools'] as const).map((g) => ({ g, n: rows.filter((r) => r.group === g).length }));
  return (
    <>
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-10" onMouseLeave={() => setHot(null)}>
        <div className="lg:col-span-12 xl:col-span-9">
          <table className="matrix" data-hot={hot ? '' : undefined}>
            <caption className="sr-only">Which technologies each project uses. Rows are technologies, columns are projects; a filled cell links to that project.</caption>
            <thead>
              <tr>
                <th scope="col" className="m-row align-bottom pb-2">
                  <span className="eyebrow">Technology</span>
                </th>
                {cols.map((c, ci) => (
                  <th key={c.slug} scope="col" className="m-th" data-hot={hot?.c === ci ? '' : undefined}>
                    <TransitionLink href={`/work/${c.slug}/`} label={c.title} onMouseEnter={() => setHot({ r: -1, c: ci })}>
                      {c.short}
                    </TransitionLink>
                  </th>
                ))}
                <th scope="col" className="m-total align-bottom pb-2">
                  <span className="eyebrow">Σ</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={r.tech} data-hot={hot?.r === ri ? '' : undefined}>
                  <th scope="row" className="m-row" onMouseEnter={() => setHot({ r: ri, c: -1 })}>
                    <span className="m-dot" data-g={r.group} aria-hidden />
                    {r.tech}
                    <span className="sr-only"> ({GROUP_LABEL[r.group]})</span>
                  </th>
                  {r.used.map((on, ci) => (
                    <td key={cols[ci].slug} data-hot={hot?.c === ci ? '' : undefined} onMouseEnter={() => setHot({ r: ri, c: ci })}>
                      {on ? <TransitionLink href={`/work/${cols[ci].slug}/`} className="cell" label={cols[ci].title} aria-label={`${r.tech} used in ${cols[ci].title}`} /> : <span className="cell" aria-hidden />}
                    </td>
                  ))}
                  <td className="m-total">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="lg:col-span-12 xl:col-span-3 xl:pt-32">
          <p className="eyebrow mb-4">Reading the ledger</p>
          <p className="text-sm text-muted">Hover a row to see where a technology shows up, a column to read one project&rsquo;s stack. Every filled cell opens the case study.</p>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-5 text-sm xl:grid-cols-1">
            {top.map((r) => (
              <div key={r.tech} className="flex items-baseline justify-between gap-3">
                <dt className="text-text">{r.tech}</dt>
                <dd className="mono text-xs text-faint">
                  {r.total} / {cols.length}
                </dd>
              </div>
            ))}
          </dl>
          <ul className="mono mt-6 grid grid-cols-2 gap-2 border-t border-border pt-5 text-xs text-faint xl:grid-cols-1" role="list" aria-label="Legend">
            {byGroup.map(({ g, n }) => (
              <li key={g} className="flex items-center gap-2">
                <span className="m-dot !mr-0 inline-block h-[7px] w-[7px] rounded-full" data-g={g} style={{ background: g === 'tools' ? 'transparent' : 'var(--accent)', opacity: g === 'web' ? 0.6 : g === 'ai' ? 0.35 : 1, outline: g === 'tools' ? '1px solid var(--text-faint)' : g === 'ai' ? '1px solid var(--accent)' : 'none', outlineOffset: -1 }} aria-hidden />
                {GROUP_LABEL[g]} · {n}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <dl className="hairline lg:hidden">
        {rows.map((r) => (
          <div key={r.tech} className="grid gap-2 border-b border-border py-4 sm:grid-cols-12 sm:gap-6">
            <dt className="flex items-baseline justify-between sm:col-span-4 sm:block">
              <span className="font-medium text-text">{r.tech}</span>
              <span className="mono ml-3 text-xs text-faint">
                {r.total} {r.total === 1 ? 'project' : 'projects'}
              </span>
            </dt>
            <dd className="flex flex-wrap gap-2 sm:col-span-8">
              {r.used.map((on, ci) =>
                on ? (
                  <TransitionLink key={cols[ci].slug} href={`/work/${cols[ci].slug}/`} className="chip hover:border-text hover:text-text" label={cols[ci].title}>
                    {cols[ci].short}
                  </TransitionLink>
                ) : null,
              )}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
