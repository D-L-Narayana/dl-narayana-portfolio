import type { Metadata } from 'next';
import { GithubLive } from '@/components/home/GithubLive';

export const metadata: Metadata = {
  title: 'GitHub, live',
  description: 'Public GitHub activity of D-L-Narayana: repositories, commit rhythm, language share and freshness — built from the GitHub API at build time.',
  alternates: { canonical: '/github/' },
  openGraph: { title: 'GitHub, live — D L Narayana', url: '/github/' },
};

export default function GithubPage() {
  return (
    <div className="pt-16 md:pt-20">
      <GithubLive full />
    </div>
  );
}
