import type { MetadataRoute } from 'next';
import { site } from '@/data/content';
import { allProjects, stats } from '@/lib/github';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date(stats.fetchedAt);
  const routes: MetadataRoute.Sitemap = ['', '/work/', '/about/', '/github/', '/contact/'].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: p === '' ? 1 : 0.7,
  }));
  for (const p of allProjects) {
    routes.push({ url: `${site.url}/work/${p.slug}/`, lastModified: p.pushedAt ? new Date(p.pushedAt) : now, changeFrequency: 'monthly', priority: 0.6 });
  }
  return routes;
}
