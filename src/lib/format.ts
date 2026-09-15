const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string | null | undefined, opts: { month?: 'short' | 'long'; day?: boolean } = {}) {
  if (!iso) return '—';
  const d = new Date(iso);
  const m = opts.month === 'long' ? d.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' }) : MONTHS[d.getUTCMonth()];
  return opts.day === false ? `${m} ${d.getUTCFullYear()}` : `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}`;
}

/** Relative freshness computed against a fixed reference (the data snapshot time) so SSR and client agree. */
export function relative(iso: string | null | undefined, ref: string) {
  if (!iso) return '—';
  const ms = new Date(ref).getTime() - new Date(iso).getTime();
  const days = Math.max(0, Math.round(ms / 86400000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 9) return `${weeks} weeks ago`;
  const months = Math.round(days / 30.4);
  if (months < 12) return `${months} months ago`;
  return `${Math.round(days / 365)} years ago`;
}

export function monthYear(ym: string) {
  const [y, m] = ym.split('-');
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : ym;
}

export const nf = new Intl.NumberFormat('en-US');
