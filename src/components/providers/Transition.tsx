'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link, { type LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

type Phase = 'idle' | 'covering' | 'covered' | 'lifting';
const Ctx = createContext<{ navigate: (href: string, label?: string) => void; phase: Phase }>({ navigate: () => {}, phase: 'idle' });

const ROUTE_LABEL: Record<string, string> = { '/': 'Home', '/work/': 'Work', '/about/': 'About', '/github/': 'GitHub', '/contact/': 'Contact', '/notes/': 'Notes', '/resume/': 'Résumé' };

const WIPE = { duration: 0.46, ease: [0.76, 0, 0.24, 1] as const };

/**
 * Where is the site mounted? At the origin root the App Router handles navigation. Under a sub-path
 * (preview proxies, file://, project pages) its absolute route paths would escape the site, so we
 * derive the mount point from the page's canonical URL and do a relative full-page navigation.
 */
function subPathTarget(href: string): string | null {
  const canon = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canon) return null;
  let route = '';
  try {
    route = new URL(canon.href).pathname;
  } catch {
    return null;
  }
  const loc = window.location.pathname;
  const clean = loc.replace(/index\.html$/, '');
  if (clean === route || !clean.endsWith(route)) return null;
  const base = clean.slice(0, clean.length - route.length);
  const suffix = /index\.html$/.test(loc) && href.endsWith('/') ? 'index.html' : '';
  return `${base}${href}${suffix}`;
}

/** Route transitions: an amber curtain rises from the bottom, the route swaps underneath, the
 *  curtain lifts away from the top. AnimatePresence owns the curtain's exit. Transform-only. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const [label, setLabel] = useState<string>('');
  const pending = useRef<string | null>(null);
  const fromPath = useRef(pathname);

  const go = useCallback(
    (href: string) => {
      const target = subPathTarget(href);
      if (target) window.location.assign(target);
      else router.push(href);
    },
    [router],
  );

  const navigate = useCallback(
    (href: string, lbl?: string) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || href === pathname) {
        go(href);
        return;
      }
      pending.current = href;
      fromPath.current = pathname;
      setLabel(lbl ?? ROUTE_LABEL[href] ?? '');
      setPhase('covering');
    },
    [pathname, go],
  );

  // Curtain fully covers → push the route.
  const onCovered = useCallback(() => {
    setPhase('covered');
    if (pending.current) go(pending.current);
  }, [go]);

  // Route changed underneath → lift.
  useEffect(() => {
    if (phase === 'covered' && pathname !== fromPath.current) {
      pending.current = null;
      const id = window.setTimeout(() => setPhase('lifting'), 60);
      return () => window.clearTimeout(id);
    }
  }, [pathname, phase]);

  // Safety: never leave the page covered (e.g. navigation to the same route).
  useEffect(() => {
    if (phase !== 'covered') return;
    const id = window.setTimeout(() => setPhase('lifting'), 1500);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'lifting') return;
    const id = window.setTimeout(() => setPhase('idle'), 20);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <Ctx.Provider value={{ navigate, phase }}>
      {children}
      <AnimatePresence>
        {phase !== 'idle' && (
          <motion.div
            key="curtain"
            className="curtain"
            aria-hidden
            style={{ transformOrigin: phase === 'lifting' ? '50% 0%' : '50% 100%' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0, transition: WIPE }}
            transition={WIPE}
            onAnimationComplete={(def) => {
              if (phase === 'covering' && typeof def === 'object' && def && 'scaleY' in def && (def as { scaleY: number }).scaleY === 1) onCovered();
            }}
          >
            {label && (
              <motion.span className="curtain-label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: phase === 'lifting' ? 0 : 1, y: 0 }} transition={{ duration: 0.28, delay: phase === 'lifting' ? 0 : 0.18 }}>
                {label}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export const useTransition = () => useContext(Ctx);

type TLProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode; label?: string };

/** A next/link that routes through the curtain for plain left-clicks on internal routes. */
export function TransitionLink({ href, onClick, children, label, ...rest }: TLProps) {
  const { navigate } = useTransition();
  const h = typeof href === 'string' ? href : ((href as { pathname?: string | null }).pathname ?? '/');
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!h.startsWith('/') || h.startsWith('/#') || rest.target === '_blank') return;
    e.preventDefault();
    navigate(h, label);
  };
  return (
    <Link href={href} onClick={handle} prefetch={false} {...rest}>
      {children}
    </Link>
  );
}
