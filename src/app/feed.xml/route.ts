import { site } from '@/data/content';
import { notes } from '@/data/notes';

export const dynamic = 'force-static';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (s: string) => s.replace(/\*\*|`|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

/** RSS 2.0 for the notes. Static: generated at build time into out/feed.xml. */
export function GET() {
  const items = [...notes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((n) => {
      const body = n.blocks
        .map((b) => (b.t === 'ul' ? `<ul>${b.items.map((i) => `<li>${esc(plain(i))}</li>`).join('')}</ul>` : b.t === 'code' ? `<pre>${esc(b.code)}</pre>` : b.t === 'h2' ? `<h2>${esc(b.text)}</h2>` : `<p>${esc(plain(b.text))}</p>`))
        .join('');
      return `<item><title>${esc(n.title)}</title><link>${site.url}/notes/${n.slug}/</link><guid isPermaLink="true">${site.url}/notes/${n.slug}/</guid><pubDate>${new Date(n.date).toUTCString()}</pubDate><description>${esc(n.dek)}</description><content:encoded><![CDATA[${body}]]></content:encoded>${n.tags.map((t) => `<category>${esc(t)}</category>`).join('')}</item>`;
    })
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(site.name)} — Notes</title><link>${site.url}/notes/</link><atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/><description>Engineering notes distilled from public repositories: data pipelines, AI systems and products.</description><language>en</language><lastBuildDate>${new Date(notes[0].date).toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
