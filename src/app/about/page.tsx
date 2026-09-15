import type { Metadata } from 'next';
import { About } from '@/components/home/About';
import { Stack } from '@/components/home/Stack';
import { Timeline } from '@/components/home/Timeline';

export const metadata: Metadata = {
  title: 'About',
  description: 'D L Narayana — data engineer, full-stack and AI product developer in Visakhapatnam. B.Tech CSE at GITAM, Class of 2027. How I work and what I use.',
  alternates: { canonical: '/about/' },
  openGraph: { title: 'About — D L Narayana', url: '/about/' },
};

export default function AboutPage() {
  return (
    <div className="pt-16 md:pt-20">
      <About full />
      <Stack index="02" />
      <Timeline index="03" />
    </div>
  );
}
