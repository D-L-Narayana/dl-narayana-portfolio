import type { Transition, Variants } from 'motion/react';

export const spring = {
  default: { type: 'spring', stiffness: 200, damping: 30 } as Transition,
  snappy: { type: 'spring', stiffness: 300, damping: 25 } as Transition,
  gentle: { type: 'spring', stiffness: 120, damping: 20 } as Transition,
  soft: { type: 'spring', stiffness: 90, damping: 22, mass: 1 } as Transition,
};

export const easeOut = [0.16, 1, 0.3, 1] as const;
export const easeWipe = [0.76, 0, 0.24, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: spring.default },
};

export const stagger = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

export const viewport = { once: true, amount: 0.25, margin: '0px 0px -8% 0px' } as const;
