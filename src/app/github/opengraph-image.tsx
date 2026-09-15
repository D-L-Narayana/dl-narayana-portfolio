import { OG_SIZE, renderOg } from '@/lib/og';
import { stats } from '@/lib/github';
import { nf } from '@/lib/format';

export const dynamic = 'force-static';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'GitHub, live — D L Narayana';

export default function Image() {
  return renderOg({ eyebrow: 'GitHub, live', title: 'The public record,', emphasis: 'unedited.', subtitle: `${stats.publicRepos} public repositories · ${nf.format(stats.commits)} commits · ${stats.activeWeeks} of ${stats.weeks} weeks active.` });
}
