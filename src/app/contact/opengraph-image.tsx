import { OG_SIZE, renderOg } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Contact — D L Narayana';

export default function Image() {
  return renderOg({ eyebrow: 'Contact', title: 'Let’s build something that', emphasis: 'holds.', subtitle: 'nvr0910@gmail.com · linkedin.com/in/dlnarayana' });
}
