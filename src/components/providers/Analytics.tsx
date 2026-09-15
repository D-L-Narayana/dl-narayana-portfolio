'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';

/** Page views on every route change + delegated clicks on any `[data-track]` element. */
export function Analytics() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    track('pageview', { path: pathname, initial: first.current });
    first.current = false;
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;
      track('click', { id: el.dataset.track ?? '', href: (el as HTMLAnchorElement).href ?? undefined });
    };
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
