import { OG_SIZE, renderOg } from '@/lib/og';
import { stats } from '@/lib/github';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Work — D L Narayana';

export default function Image() {
  return renderOg({ eyebrow: 'Work', title: 'Work,', emphasis: 'indexed.', subtitle: `${stats.publicRepos} public projects — data pipelines, AI systems, full-stack products and tools, driven by live GitHub data.` });
}
