'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** One IntersectionObserver for every `[data-reveal]` element: adds `data-in` when it scrolls into
 *  view. The transition itself is CSS (opacity + translateY), so dense lists reveal with zero
 *  per-item JavaScript. Re-scans on every route change. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-in])'));
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => (el.dataset.in = 'true'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = 'true';
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
