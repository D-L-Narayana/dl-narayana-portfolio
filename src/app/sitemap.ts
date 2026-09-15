import type { MetadataRoute } from 'next';
import { site } from '@/data/content';
import { notes } from '@/data/notes';
import { allProjects, stats } from '@/lib/github';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(stats.fetchedAt);
  const routes: MetadataRoute.Sitemap = ['', '/work/', '/notes/', '/about/', '/github/', '/resume/', '/contact/'].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: p === '' ? 1 : 0.7,
  }));
  for (const p of allProjects) {
    routes.push({ url: `${site.url}/work/${p.slug}/`, lastModified: p.pushedAt ? new Date(p.pushedAt) : now, changeFrequency: 'monthly', priority: 0.6 });
  }
  for (const n of notes) {
    routes.push({ url: `${site.url}/notes/${n.slug}/`, lastModified: new Date(n.date), changeFrequency: 'yearly', priority: 0.5 });
  }
  return routes;
}
