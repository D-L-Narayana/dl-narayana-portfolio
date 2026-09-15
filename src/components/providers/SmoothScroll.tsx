'use client';

import Lenis from 'lenis';
import { cancelFrame, frame } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scroll ticked from Motion's own frame loop — one rAF for the whole page. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduce || coarse) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.105, smoothWheel: true, syncTouch: false, wheelMultiplier: 1 });
    window.__lenis = lenis;
    const update = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
    frame.update(update, true);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -72 });
      history.replaceState(null, '', `#${id}`);
      if (el instanceof HTMLElement) el.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelFrame(update);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // New route → start at the top, instantly (the curtain hides the jump).
  useEffect(() => {
    const l = window.__lenis;
    if (l) l.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}
