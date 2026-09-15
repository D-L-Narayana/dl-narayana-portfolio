import { TransitionLink } from '@/components/providers/Transition';
import { Monogram } from '@/components/ui/Wordmark';
import { site } from '@/data/content';
import { stats } from '@/lib/github';
import { formatDate } from '@/lib/format';
import { BackToTop } from './BackToTop';
import { LocalTime } from './LocalTime';

const cols = [
  {
    title: 'Site',
    links: [
      { href: '/', label: 'Home' },
      { href: '/work/', label: 'Work' },
      { href: '/notes/', label: 'Notes' },
      { href: '/about/', label: 'About' },
      { href: '/github/', label: 'GitHub, live' },
      { href: '/resume/', label: 'Résumé' },
      { href: '/contact/', label: 'Contact' },
    ],
  },
  {
    title: 'Elsewhere',
    links: [
      { href: site.github, label: 'GitHub ↗' },
      { href: site.linkedin, label: 'LinkedIn ↗' },
      { href: `mailto:${site.email}`, label: site.email },
      { href: site.resumePdf, label: 'Résumé (PDF) ↓' },
      { href: '/feed.xml', label: 'RSS feed' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="hairline mt-24">
      <div className="shell grid gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6">
          <div className="flex items-center gap-3 text-text">
            <Monogram size={26} />
            <span className="font-display text-xl">{site.name}</span>
          </div>
          <p className="prose mt-6 max-w-[38ch] text-sm">
            Data engineer, full-stack and AI product developer in {site.location}. {site.education}.
          </p>
          <p className="eyebrow mt-8">{site.motto}</p>
          <p className="mono mt-6 text-xs text-faint">
            {site.location} · <LocalTime timeZone={site.timezone} />
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="md:col-span-3">
            <p className="eyebrow mb-5">{c.title}</p>
            <ul className="flex flex-col gap-3 text-sm" role="list">
              {c.links.map((l) =>
                l.href.startsWith('/') && !l.href.includes('.') ? (
                  <li key={l.href}>
                    <TransitionLink href={l.href} className="link-underline text-muted hover:text-text" label={l.label.replace(/ ↗| ↓/, '')}>
                      {l.label}
                    </TransitionLink>
                  </li>
                ) : (
                  <li key={l.href}>
                    <a href={l.href} className="link-underline text-muted hover:text-text" target={l.href.startsWith('http') ? '_blank' : undefined} rel={l.href.startsWith('http') ? 'noreferrer' : undefined} download={l.href.endsWith('.pdf') ? '' : undefined}>
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
        <div className="shell flex flex-col gap-3 py-6 text-xs text-faint md:flex-row md:items-center md:justify-between">
          <p className="mono">© {new Date(stats.fetchedAt).getUTCFullYear()} {site.name} · Next.js + Motion · self-hosted Zodiak, Satoshi &amp; JetBrains Mono · no trackers, no cookies</p>
          <div className="flex items-center gap-6">
            <p className="mono">GitHub data snapshot: {formatDate(stats.fetchedAt)}</p>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
