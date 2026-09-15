'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Magnetic } from '@/components/ui/Magnetic';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <Magnetic strength={0.2}>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Switch to ${next} theme`}
        title={`Switch to ${next} theme`}
        className="grid h-10 w-10 place-items-center rounded-full border border-border text-text transition-colors hover:border-text"
      >
        <span className="relative block h-5 w-5" aria-hidden>
          <AnimatePresence initial={false} mode="popLayout">
            {theme === 'dark' ? (
              <motion.svg key="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" initial={{ rotate: -90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.6 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="absolute inset-0">
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
              </motion.svg>
            ) : (
              <motion.svg key="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" initial={{ rotate: 90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.6 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="absolute inset-0">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>
      </button>
    </Magnetic>
  );
}
