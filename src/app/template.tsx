'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

let navigated = false;

/** Re-mounts on every route change: the incoming page settles in (opacity + 14px). Skipped on the
 *  very first paint so the LCP is never delayed by an entrance animation. */
export default function Template({ children }: { children: ReactNode }) {
  const animate = useRef(navigated);
  useEffect(() => {
    navigated = true;
  }, []);
  return (
    <motion.div initial={animate.current ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}>
      {children}
    </motion.div>
  );
}
