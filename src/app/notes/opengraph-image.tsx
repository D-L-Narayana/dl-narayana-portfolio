import { OG_SIZE, renderOg } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Notes — D L Narayana';

export default function Image() {
  return renderOg({ eyebrow: 'Engineering notes', title: 'Notes from the', emphasis: 'build log.', subtitle: 'Streaming lakehouses, data-quality gates, quantisation trade-offs, agents with brakes and ML in the browser tab.' });
}
