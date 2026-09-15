import { TransitionLink } from '@/components/providers/Transition';
import { Monogram } from '@/components/ui/Wordmark';
import { site } from '@/data/content';
import { stats } from '@/lib/github';
import { formatDate } from '@/lib/format';

const cols = [
  { title: 'Site', links: [{ href: '/', label: 'Home' }, { href: '/work/', label: 'Work' }, { href: '/about/', label: 'About' }, { href: '/github/', label: 'GitHub, live' }, { href: '/contact/', label: 'Contact' }] },
  { title: 'Elsewhere', links: [{ href: site.github, label: 'GitHub ↗' }, { href: site.linkedin, label: 'LinkedIn ↗' }, { href: `mailto:${site.email}`, label: site.email }] },
];

export function Footer() {
  return (
    <footer className="hairline mt-24">
      <div className="container grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 text-text">
            <Monogram size={26} />
            <span className="font-display text-xl">D L Narayana</span>
          </div>
          <p className="prose mt-6 max-w-[38ch] text-sm">
            Data engineer, full-stack and AI product developer in {site.location}. {site.education}.
          </p>
          <p className="eyebrow mt-8">Build things that matter. Ship things that work.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="md:col-span-3">
            <p className="eyebrow mb-5">{c.title}</p>
            <ul className="flex flex-col gap-3 text-sm" role="list">
              {c.links.map((l) =>
                l.href.startsWith('/') ? (
                  <li key={l.href}>
                    <TransitionLink href={l.href} className="link-underline text-muted hover:text-text">
                      {l.label}
                    </TransitionLink>
                  </li>
                ) : (
                  <li key={l.href}>
                    <a href={l.href} className="link-underline text-muted hover:text-text" target={l.href.startsWith('http') ? '_blank' : undefined} rel={l.href.startsWith('http') ? 'noreferrer' : undefined}>
                      {l.label}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>
      <div className="hairline">
        <div className="container flex flex-col gap-2 py-6 text-xs text-faint md:flex-row md:items-center md:justify-between">
          <p className="mono">© {new Date(stats.fetchedAt).getUTCFullYear()} D L Narayana · Next.js + Motion · self-hosted Zodiak, Satoshi & JetBrains Mono</p>
          <p className="mono">GitHub data snapshot: {formatDate(stats.fetchedAt)}</p>
        </div>
      </div>
    </footer>
  );
}
