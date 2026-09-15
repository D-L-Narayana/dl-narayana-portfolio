'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

/** Wraps an interactive element: it drifts toward the pointer (spring) and tells the custom cursor
 *  to snap to it. Inert on touch devices and under reduced motion. */
export function Magnetic({ children, strength = 0.28, className, radius }: { children: ReactNode; strength?: number; className?: string; radius?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 170, damping: 15, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 170, damping: 15, mass: 0.35 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)');
    const check = () => setFine(mq.matches);
    check();
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  const active = fine && !reduce;
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!active || !ref.current) return;
    const b = ref.current.getBoundingClientRect();
    x.set((e.clientX - (b.left + b.width / 2)) * strength);
    y.set((e.clientY - (b.top + b.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className ? `inline-block ${className}` : 'inline-block'}
      style={{ x: sx, y: sy, borderRadius: radius ?? '999px' }}
      data-cursor={active ? 'magnetic' : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
