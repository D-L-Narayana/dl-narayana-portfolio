'use client';

import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Magnetic } from '@/components/ui/Magnetic';
import { Wordmark } from '@/components/ui/Wordmark';
import { site } from '@/data/content';
import { ThemeToggle } from './ThemeToggle';

const links = [
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: '/github/', label: 'GitHub' },
  { href: '/contact/', label: 'Contact' },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.__lenis?.stop();
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      window.__lenis?.start();
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-[100]">
        <motion.div
          className="border-b"
          initial={false}
          animate={{ backgroundColor: scrolled ? 'color-mix(in oklab, var(--bg) 86%, transparent)' : 'rgba(0,0,0,0)', borderColor: scrolled ? 'var(--border)' : 'rgba(0,0,0,0)' }}
          transition={{ duration: 0.3 }}
          style={{ backdropFilter: scrolled ? 'blur(14px) saturate(140%)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(140%)' : 'none' }}
        >
          <nav className="container flex h-16 items-center justify-between gap-6" aria-label="Primary">
            <TransitionLink href="/" aria-label="D L Narayana — home" className="text-text">
              <Wordmark />
            </TransitionLink>

            <LayoutGroup id="nav">
              <ul className="hidden items-center gap-1 md:flex" role="list">
                {links.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <li key={l.href} className="relative">
                      <Magnetic strength={0.18}>
                        <TransitionLink href={l.href} aria-current={active ? 'page' : undefined} className={`relative isolate block rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? 'text-text' : 'text-muted hover:text-text'}`}>
                          {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-surface-2" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                          <span className="relative">{l.label}</span>
                        </TransitionLink>
                      </Magnetic>
                    </li>
                  );
                })}
              </ul>
            </LayoutGroup>

            <div className="flex items-center gap-2 md:gap-3">
              <Magnetic strength={0.2} className="hidden sm:inline-block">
                <a href={`mailto:${site.email}`} className="btn btn-ghost !h-10 !px-4 text-sm">
                  Email me
                </a>
              </Magnetic>
              <ThemeToggle />
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-border md:hidden"
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((o) => !o)}
              >
                <span className="relative block h-3 w-5" aria-hidden>
                  <motion.span className="absolute left-0 top-0 block h-[1.5px] w-5 bg-current" animate={{ y: open ? 5.5 : 0, rotate: open ? 45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} />
                  <motion.span className="absolute left-0 bottom-0 block h-[1.5px] w-5 bg-current" animate={{ y: open ? -5.5 : 0, rotate: open ? -45 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} />
                </span>
              </button>
            </div>
          </nav>
        </motion.div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" className="fixed inset-0 z-[95] flex flex-col bg-bg pt-24 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <motion.ul className="container flex flex-col gap-2" role="list" initial="hidden" animate="show" exit="hidden" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}>
              {links.map((l) => (
                <motion.li key={l.href} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 26 } } }}>
                  <TransitionLink href={l.href} className="title flex items-baseline justify-between border-b border-border py-5" aria-current={isActive(l.href) ? 'page' : undefined}>
                    {l.label}
                    <span className="eyebrow">{isActive(l.href) ? 'here' : '→'}</span>
                  </TransitionLink>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="pt-6">
                <a href={`mailto:${site.email}`} className="btn btn-primary">
                  {site.email}
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
