'use client';

import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useTransition } from '@/components/providers/Transition';
import { site } from '@/data/content';
import { track } from '@/lib/analytics';

export type PaletteEntry = { id: string; group: 'Pages' | 'Projects' | 'Notes' | 'Actions'; label: string; hint?: string; href?: string; icon: string; keywords?: string };

type Ctx = { open: () => void; close: () => void; isOpen: boolean };
const PaletteCtx = createContext<Ctx>({ open: () => {}, close: () => {}, isOpen: false });
export const usePalette = () => useContext(PaletteCtx);

/* ---- fuzzy matching: subsequence with word-start and adjacency bonuses ---------------------- */
function fuzzy(query: string, text: string): { score: number; idx: number[] } | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return { score: 0, idx: [] };
  const idx: number[] = [];
  let score = 0, ti = 0, prev = -2;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const at = t.indexOf(ch, ti);
    if (at === -1) return null;
    score += at === prev + 1 ? 6 : 1;
    if (at === 0 || /[\s\-_/.(]/.test(t[at - 1])) score += 5;
    idx.push(at);
    prev = at;
    ti = at + 1;
  }
  const dense = t.startsWith(q) ? 12 : 0;
  return { score: score + dense - Math.min(t.length, 40) * 0.05, idx };
}

function Highlight({ text, idx }: { text: string; idx: number[] }) {
  if (!idx.length) return <>{text}</>;
  const set = new Set(idx);
  const out: ReactNode[] = [];
  let run = '';
  let inMark = false;
  const flush = (k: number) => {
    if (!run) return;
    out.push(inMark ? <mark key={k}>{run}</mark> : <span key={k}>{run}</span>);
    run = '';
  };
  for (let i = 0; i < text.length; i++) {
    const m = set.has(i);
    if (m !== inMark) {
      flush(i);
      inMark = m;
    }
    run += text[i];
  }
  flush(text.length);
  return <>{out}</>;
}

export function PaletteProvider({ children, entries }: { children: ReactNode; entries: PaletteEntry[] }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <PaletteCtx.Provider value={{ open, close, isOpen }}>
      {children}
      <AnimatePresence>{isOpen && <Palette entries={entries} onClose={close} />}</AnimatePresence>
    </PaletteCtx.Provider>
  );
}

function Palette({ entries, onClose }: { entries: PaletteEntry[]; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const { theme, toggle } = useTheme();
  const { navigate } = useTransition();
  const pathname = usePathname();

  // Focus in, lock scroll, restore focus out.
  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    window.__lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    track('palette_open', { path: pathname });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
      restoreRef.current?.focus?.();
    };
  }, [pathname]);

  const actions: PaletteEntry[] = useMemo(
    () => [
      { id: 'theme', group: 'Actions', label: `Switch to ${theme === 'dark' ? 'paper' : 'ink'} theme`, hint: theme === 'dark' ? 'Light' : 'Dark', icon: theme === 'dark' ? '☼' : '☾', keywords: 'theme dark light mode toggle' },
      { id: 'copy-email', group: 'Actions', label: copied ? 'Copied to clipboard' : 'Copy email address', hint: site.email, icon: '@', keywords: 'email contact mail copy' },
      { id: 'resume', group: 'Actions', label: 'Download résumé (PDF)', hint: 'One page', href: site.resumePdf, icon: '↓', keywords: 'resume cv pdf download' },
      { id: 'github', group: 'Actions', label: 'Open GitHub profile', hint: 'github.com/D-L-Narayana', href: site.github, icon: '↗', keywords: 'github code repos' },
      { id: 'linkedin', group: 'Actions', label: 'Open LinkedIn', hint: 'linkedin.com/in/dlnarayana', href: site.linkedin, icon: '↗', keywords: 'linkedin' },
    ],
    [theme, copied],
  );

  const all = useMemo(() => [...entries, ...actions], [entries, actions]);

  const results = useMemo(() => {
    const query = q.trim();
    const scored = all
      .map((e) => {
        // Fuzzy (subsequence) on the label; plain substring on hint/keywords so "spark" does not
        // match every tagline that happens to contain those letters in order.
        const labelMatch = fuzzy(query, e.label);
        const meta = `${e.hint ?? ''} ${e.keywords ?? ''}`.toLowerCase();
        const metaMatch = query && meta.includes(query.toLowerCase());
        if (!labelMatch && !metaMatch) return null;
        const score = (labelMatch ? labelMatch.score + 4 : 0) + (metaMatch ? 3 : 0);
        return { e, score, idx: labelMatch?.idx ?? [] };
      })
      .filter((x): x is { e: PaletteEntry; score: number; idx: number[] } => x !== null);
    if (!query) {
      // Default view: pages, a handful of projects, notes, actions.
      const pick = (g: PaletteEntry['group'], n: number) => scored.filter((x) => x.e.group === g).slice(0, n);
      return [...pick('Pages', 99), ...pick('Projects', 6), ...pick('Notes', 3), ...pick('Actions', 99)];
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 18);
  }, [all, q]);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const run = useCallback(
    (e: PaletteEntry) => {
      track('palette_run', { id: e.id });
      if (e.id === 'theme') {
        toggle();
        return;
      }
      if (e.id === 'copy-email') {
        navigator.clipboard?.writeText(site.email).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
        return;
      }
      if (!e.href) return;
      if (e.href.startsWith('/') && !e.href.endsWith('.pdf')) {
        onClose();
        if (e.href !== pathname) navigate(e.href);
        return;
      }
      if (e.href.endsWith('.pdf')) {
        const a = document.createElement('a');
        a.href = e.href;
        a.download = '';
        a.click();
        onClose();
        return;
      }
      window.open(e.href, '_blank', 'noopener,noreferrer');
      onClose();
    },
    [navigate, onClose, pathname, toggle],
  );

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => (results.length ? (s + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => (results.length ? (s - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[sel];
      if (r) run(r.e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // focus stays on the input; the list is driven by the arrow keys
    }
  };

  const groups: PaletteEntry['group'][] = ['Pages', 'Projects', 'Notes', 'Actions'];
  let flat = -1;

  return (
    <>
      <motion.div className="palette-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} />
      <motion.div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        onKeyDown={onKey}
      >
        <div className="palette-input">
          <span className="mono text-sm text-accent" aria-hidden>
            ›
          </span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages, projects, notes, actions…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[sel] ? `pi-${results[sel].e.id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="kbd" onClick={onClose} aria-label="Close">
            esc
          </button>
        </div>
        <div id="palette-list" ref={listRef} className="palette-list" role="listbox" aria-label="Results">
          {results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Nothing matches &ldquo;{q}&rdquo;. Try a project name, &ldquo;theme&rdquo; or &ldquo;email&rdquo;.
            </p>
          )}
          {groups.map((g) => {
            const rows = results.filter((r) => r.e.group === g);
            if (!rows.length) return null;
            return (
              <div key={g} role="group" aria-label={g}>
                <p className="palette-group eyebrow">{g}</p>
                {rows.map((r) => {
                  flat += 1;
                  const i = flat;
                  return (
                    <div
                      key={r.e.id}
                      id={`pi-${r.e.id}`}
                      role="option"
                      aria-selected={i === sel}
                      data-i={i}
                      className="palette-item"
                      onMouseMove={() => setSel(i)}
                      onClick={() => run(r.e)}
                    >
                      <span className="pi-icon" aria-hidden>
                        {r.e.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          <Highlight text={r.e.label} idx={r.idx} />
                        </span>
                        {r.e.hint && <span className="block truncate text-xs text-faint">{r.e.hint}</span>}
                      </span>
                      {i === sel && (
                        <span className="kbd" aria-hidden>
                          ↵
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="palette-foot">
          <span>
            <span className="kbd">↑</span> <span className="kbd">↓</span> navigate
          </span>
          <span>
            <span className="kbd">↵</span> open
          </span>
          <span>
            <span className="kbd">esc</span> close
          </span>
          <span className="ml-auto">
            <span className="kbd">⌘</span> <span className="kbd">K</span> anywhere
          </span>
        </div>
      </motion.div>
    </>
  );
}

/** The nav trigger: shows the shortcut on fine-pointer devices, a search glyph elsewhere. */
export function PaletteButton({ className = '' }: { className?: string }) {
  const { open } = usePalette();
  return (
    <button type="button" onClick={open} className={`inline-flex h-10 items-center gap-2 rounded-full border border-border px-3 text-sm text-muted transition-colors hover:border-text hover:text-text ${className}`} aria-keyshortcuts="Meta+K Control+K" title="Command palette (⌘K)">
      <span className="sr-only">Command palette</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-4.2-4.2" />
      </svg>
      <span className="hidden items-center gap-1 lg:inline-flex">
        <span className="kbd">⌘</span>
        <span className="kbd">K</span>
      </span>
    </button>
  );
}
