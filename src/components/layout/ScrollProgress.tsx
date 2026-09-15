'use client';

import { motion, useScroll, useSpring } from 'motion/react';

/** Hairline reading-progress bar under the nav — scroll-linked, scaleX only. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  return <motion.div aria-hidden className="fixed left-0 top-0 z-[90] h-[2px] w-full origin-left bg-accent" style={{ scaleX }} />;
}
