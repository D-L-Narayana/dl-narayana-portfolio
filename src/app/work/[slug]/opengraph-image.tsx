import { OG_SIZE, renderOg } from '@/lib/og';
import { CATEGORY_LABEL } from '@/data/projects';
import { allProjects, projectBySlug } from '@/lib/github';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  return renderOg({ eyebrow: p ? CATEGORY_LABEL[p.category] : 'Work', title: p?.title ?? 'Work', subtitle: p?.tagline, footer: p ? `github.com/D-L-Narayana/${p.slug}` : undefined });
}
