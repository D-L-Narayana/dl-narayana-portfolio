import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { Providers } from '@/components/providers/Providers';
import { site } from '@/data/content';
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
  src: [
    { path: '../fonts/Satoshi-Variable.woff2', weight: '300 900', style: 'normal' },
    { path: '../fonts/Satoshi-VariableItalic.woff2', weight: '300 900', style: 'italic' },
  ],
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
  keywords: ['data engineer', 'PySpark', 'Kafka', 'Debezium', 'CDC', 'lakehouse', 'Next.js', 'TypeScript', 'LangGraph', 'portfolio', 'Visakhapatnam'],
  openGraph: { type: 'website', siteName: 'D L Narayana', title: site.title, description: site.description, url: '/' },
  twitter: { card: 'summary_large_image', title: site.title, description: site.description },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }], apple: '/apple-touch-icon.png' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0b09' },
    { media: '(prefers-color-scheme: light)', color: '#f4f0e6' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Applies the system colour scheme before first paint. No storage APIs anywhere.
const themeScript = `(function(){try{var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',d?'dark':'light');document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})();`;

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
      </head>
      <body>
        <Providers>
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
