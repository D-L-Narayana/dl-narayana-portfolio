import { About } from '@/components/home/About';
import { Contact } from '@/components/home/Contact';
import { FeaturedWork } from '@/components/home/FeaturedWork';
import { GithubLive } from '@/components/home/GithubLive';
import { Hero } from '@/components/home/Hero';
import { Stack } from '@/components/home/Stack';
import { Timeline } from '@/components/home/Timeline';
import { stats } from '@/lib/github';

export default function HomePage() {
  return (
    <>
      <Hero stats={{ publicRepos: stats.publicRepos, commits: stats.commits, liveDemos: stats.liveDemos, lastPush: stats.lastPush }} />
      <FeaturedWork />
      <GithubLive />
      <About />
      <Stack />
      <Timeline />
      <Contact />
    </>
  );
}
