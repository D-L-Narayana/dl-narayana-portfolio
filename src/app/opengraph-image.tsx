import { OG_SIZE, renderOg } from '@/lib/og';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'D L Narayana — Pipelines that hold. Products that ship.';

export default function Image() {
  return renderOg({ eyebrow: 'Data · Full-stack · AI', title: 'Pipelines that hold.', emphasis: 'Products that ship.', subtitle: 'Real-time CDC lakehouses, PySpark warehouses, multi-agent AI systems and full-stack products — Visakhapatnam, India.' });
}
