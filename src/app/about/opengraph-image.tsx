import { OG_SIZE, renderOg } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'About — D L Narayana';

export default function Image() {
  return renderOg({ eyebrow: 'About', title: 'Real products,', emphasis: 'not demos.', subtitle: 'Data engineer, full-stack and AI product developer. B.Tech CSE at GITAM, Class of 2027.' });
}
