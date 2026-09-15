'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

/**
 * Counts a metric up when it scrolls into view, preserving the original formatting: thousands
 * separators, decimals, units and suffixes ("510,663", "29.5 s", "~17.3K/s", "−66 %"). Values
 * without a leading number ("HITL") render as-is. Reduced motion: final value immediately.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const m = /^([^\d]*)(\d[\d,]*)(\.\d+)?(.*)$/.exec(value);

  useEffect(() => {
    if (!m || !inView || reduce || !ref.current) return;
    const el = ref.current;
    const [, prefix, intPart, decPart = '', suffix] = m;
    const grouped = intPart.includes(',');
    const target = Number(intPart.replace(/,/g, '') + decPart);
    const decimals = decPart ? decPart.length - 1 : 0;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const fixed = v.toFixed(decimals);
        const [i, d] = fixed.split('.');
        const int = grouped ? Number(i).toLocaleString('en-US') : i;
        el.textContent = `${prefix}${int}${d ? `.${d}` : ''}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, m]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
