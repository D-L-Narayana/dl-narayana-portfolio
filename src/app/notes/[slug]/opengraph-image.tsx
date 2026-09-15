import { OG_SIZE, renderOg } from '@/lib/og';
import { getNote, notes } from '@/data/notes';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = getNote(slug);
  return renderOg({ eyebrow: 'Engineering note', title: n?.title ?? 'Notes', subtitle: n?.dek, footer: n ? `dln-portfolio.vercel.app/notes/${n.slug}` : undefined });
}
