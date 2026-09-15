'use client';

import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { Cursor } from './Cursor';
import { SmoothScroll } from './SmoothScroll';
import { ThemeProvider } from './ThemeProvider';
import { TransitionProvider } from './Transition';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <SmoothScroll>
          <TransitionProvider>
            {children}
            <Cursor />
          </TransitionProvider>
        </SmoothScroll>
      </ThemeProvider>
    </MotionConfig>
  );
}
