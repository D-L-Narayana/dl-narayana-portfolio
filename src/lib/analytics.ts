/**
 * Analytics-ready hooks with no vendor baked in. `track()` fans an event out to whatever the host
 * page provides: a `dataLayer` (GA4 / GTM), `window.plausible`, `window.umami`, and a DOM
 * `CustomEvent('analytics')` any script can listen to. Nothing is stored, nothing is sent unless one
 * of those exists. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to inject Plausible's script from layout.tsx.
 */
export type EventProps = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    plausible?: (event: string, opts?: { props?: EventProps }) => void;
    umami?: { track: (event: string, props?: EventProps) => void };
  }
}

export function track(event: string, props: EventProps = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('analytics', { detail: { event, props, ts: Date.now() } }));
    window.dataLayer?.push({ event, ...props });
    window.plausible?.(event, { props });
    window.umami?.track(event, props);
  } catch {
    /* analytics must never break the page */
  }
}
