'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Ctx = { theme: Theme; toggle: () => void; set: (t: Theme) => void };

const ThemeContext = createContext<Ctx>({ theme: 'dark', toggle: () => {}, set: () => {} });

/** Theme lives in memory only (no storage APIs). The inline script in layout.tsx applies the
 *  system preference before first paint; this provider then takes over. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as Theme | null;
    if (current === 'light' || current === 'dark') setTheme(current);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => set(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = useCallback((t: Theme) => {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t;
  }, []);

  const toggle = useCallback(() => set(theme === 'dark' ? 'light' : 'dark'), [theme, set]);

  return <ThemeContext.Provider value={{ theme, toggle, set }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
