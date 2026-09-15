'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link, { type LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

type Phase = 'idle' | 'covering' | 'covered' | 'lifting';
const Ctx = createContext<{ navigate: (href: string) => void; phase: Phase }>({ navigate: () => {}, phase: 'idle' });

const WIPE = { duration: 0.46, ease: [0.76, 0, 0.24, 1] as const };

/** Route transitions: an amber curtain rises from the bottom, the route swaps underneath, the
 *  curtain lifts away from the top. AnimatePresence owns the curtain's exit. Transform-only. */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const pending = useRef<string | null>(null);
  const fromPath = useRef(pathname);

  const navigate = useCallback(
    (href: string) => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || href === pathname) {
        router.push(href);
        return;
      }
      pending.current = href;
      fromPath.current = pathname;
      setPhase('covering');
    },
    [pathname, router],
  );

  // Curtain fully covers → push the route.
  const onCovered = useCallback(() => {
    setPhase('covered');
    if (pending.current) router.push(pending.current);
  }, [router]);

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
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export const useTransition = () => useContext(Ctx);

type TLProps = LinkProps & AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

/** A next/link that routes through the curtain for plain left-clicks on internal routes. */
export function TransitionLink({ href, onClick, children, ...rest }: TLProps) {
  const { navigate } = useTransition();
  const h = typeof href === 'string' ? href : ((href as { pathname?: string | null }).pathname ?? '/');
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!h.startsWith('/') || h.startsWith('/#') || rest.target === '_blank') return;
    e.preventDefault();
    navigate(h);
  };
  return (
    <Link href={href} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}
