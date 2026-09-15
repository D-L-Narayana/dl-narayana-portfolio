'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { PaletteProvider, type PaletteEntry } from '@/components/palette/CommandPalette';
import { Analytics } from './Analytics';
import { Cursor } from './Cursor';
import { RevealObserver } from './RevealObserver';
import { SmoothScroll } from './SmoothScroll';
import { ThemeProvider } from './ThemeProvider';
import { TransitionProvider } from './Transition';

export function Providers({ children, palette }: { children: ReactNode; palette: PaletteEntry[] }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <SmoothScroll>
          <TransitionProvider>
            <PaletteProvider entries={palette}>
              {children}
              <Cursor />
              <RevealObserver />
              <Analytics />
            </PaletteProvider>
          </TransitionProvider>
        </SmoothScroll>
      </ThemeProvider>
    </MotionConfig>
  );
}
