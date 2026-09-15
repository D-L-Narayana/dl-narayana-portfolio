import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { Intro } from '@/components/providers/Intro';
import { Providers } from '@/components/providers/Providers';
import type { PaletteEntry } from '@/components/palette/CommandPalette';
import { site } from '@/data/content';
import { notes } from '@/data/notes';
import { CATEGORY_LABEL } from '@/data/projects';
import { allProjects, stats } from '@/lib/github';
import { formatDate } from '@/lib/format';
import './globals.css';

const zodiak = localFont({
  src: [
    { path: '../fonts/Zodiak-Variable.woff2', weight: '100 900', style: 'normal' },
    { path: '../fonts/Zodiak-VariableItalic.woff2', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-zodiak',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: 'Times New Roman',
});
const satoshi = localFont({
  src: [{ path: '../fonts/Satoshi-Variable.woff2', weight: '300 900', style: 'normal' }],
  variable: '--font-satoshi',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
});
const jetbrains = localFont({
  src: [{ path: '../fonts/JetBrainsMono-Variable.woff2', weight: '100 800', style: 'normal' }],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
  fallback: ['ui-monospace', 'Menlo', 'monospace'],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: '%s — D L Narayana' },
  description: site.description,
  applicationName: 'D L Narayana — Portfolio',
  authors: [{ name: 'D L Narayana', url: site.github }],
  creator: 'D L Narayana',
  keywords: ['data engineer', 'PySpark', 'Kafka', 'Debezium', 'CDC', 'lakehouse', 'Next.js', 'TypeScript', 'LangGraph', 'ONNX Runtime Web', 'portfolio', 'Visakhapatnam'],
  openGraph: { type: 'website', siteName: 'D L Narayana', title: site.title, description: site.description, url: '/' },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }], apple: '/apple-touch-icon.png' },
  alternates: { canonical: '/', types: { 'application/rss+xml': '/feed.xml' } },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0b09' },
    { media: '(prefers-color-scheme: light)', color: '#f4f0e6' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Applies the system colour scheme before first paint and decides whether the intro sequence plays
// (never under reduced motion, never when arriving from another page of this site). No storage APIs.
const themeScript = `(function(){try{var h=document.documentElement;var d=window.matchMedia('(prefers-color-scheme: dark)').matches;h.setAttribute('data-theme',d?'dark':'light');h.style.colorScheme=d?'dark':'light';var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var same=false;try{same=!!document.referrer&&new URL(document.referrer).origin===location.origin}catch(e){}if(!rm&&!same&&location.pathname==='/')h.classList.add('has-intro')}catch(e){}})();`;

const palette: PaletteEntry[] = [
  { id: 'home', group: 'Pages', label: 'Home', hint: 'Pipelines that hold. Products that ship.', href: '/', icon: '⌂' },
  { id: 'work', group: 'Pages', label: 'Work', hint: `${stats.publicRepos} public projects`, href: '/work/', icon: '01' },
  { id: 'notes', group: 'Pages', label: 'Notes', hint: `${notes.length} engineering notes`, href: '/notes/', icon: '02' },
  { id: 'about', group: 'Pages', label: 'About', hint: 'How I work', href: '/about/', icon: '03' },
  { id: 'github-page', group: 'Pages', label: 'GitHub, live', hint: `Snapshot ${formatDate(stats.fetchedAt)}`, href: '/github/', icon: '04' },
  { id: 'resume-page', group: 'Pages', label: 'Résumé', hint: 'One page, printable', href: '/resume/', icon: 'CV' },
  { id: 'contact', group: 'Pages', label: 'Contact', hint: site.email, href: '/contact/', icon: '@' },
  ...allProjects.map((p): PaletteEntry => ({ id: `p-${p.slug}`, group: 'Projects', label: p.title, hint: `${CATEGORY_LABEL[p.category]} · ${p.tagline}`, href: `/work/${p.slug}/`, icon: p.title.slice(0, 2).toUpperCase(), keywords: p.stack.join(' ') })),
  ...notes.map((n): PaletteEntry => ({ id: `n-${n.slug}`, group: 'Notes', label: n.title, hint: n.dek, href: `/notes/${n.slug}/`, icon: '¶', keywords: n.tags.join(' ') })),
];

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'D L Narayana',
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: 'Data Engineer · Full-Stack Developer · AI Product Engineer',
  address: { '@type': 'PostalAddress', addressLocality: 'Visakhapatnam', addressCountry: 'IN' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'GITAM' },
  sameAs: [site.github, site.linkedin],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${zodiak.variable} ${satoshi.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && <script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" />}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-reveal] > *{clip-path:none!important}.word-rise{transform:none!important;animation:none!important}.fade-rise{opacity:1!important;transform:none!important;animation:none!important}.intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <Intro repos={stats.publicRepos} commits={stats.commits} snapshot={formatDate(stats.fetchedAt)} />
        <Providers palette={palette}>
          <ScrollProgress />
          <Nav />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <div className="grain" aria-hidden="true" />
        </Providers>
      </body>
    </html>
  );
}
