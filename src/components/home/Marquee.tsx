'use client';

import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, wrap } from 'motion/react';
import { useRef } from 'react';

/** Velocity-aware marquee: drifts on its own, accelerates and reverses with scroll velocity.
 *  translateX only; hooked into Motion's frame loop via useAnimationFrame. */
export function Marquee({ items, baseVelocity = 40 }: { items: string[]; baseVelocity?: number }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false });
  const direction = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const dt = Math.min(delta, 50) / 1000;
    let move = direction.current * baseVelocity * dt * 0.1;
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const row = [...items, ...items];
  return (
    <div className="marquee hairline border-b border-border py-5" data-cursor="drag">
      <motion.div className="marquee-track" style={{ x }}>
        {row.map((it, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-[clamp(1.5rem,1.2rem+1.4vw,2.5rem)] text-muted">
            {it}
            <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
