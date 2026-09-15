'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';
import { fadeUp, spring, stagger, viewport } from '@/lib/motion';

type Props = { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'p' | 'header' | 'footer' } & Omit<HTMLMotionProps<'div'>, 'children'>;

/** Enters when scrolled into view: opacity + 22px translate, spring-settled. The element owns its
 *  final layout box from the first paint, so there is no layout shift. */
export function Reveal({ children, delay = 0, className, as = 'div', ...rest }: Props) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={viewport} variants={fadeUp} transition={{ ...spring.default, delay }} {...rest}>
      {children}
    </Tag>
  );
}

/** Parent that staggers its Reveal-like children (children must use `variants={fadeUp}`). */
export function RevealGroup({ children, className, gap = 0.06, delay = 0, as = 'div' }: { children: ReactNode; className?: string; gap?: number; delay?: number; as?: 'div' | 'ul' | 'ol' | 'section' | 'dl' }) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={viewport} variants={stagger(gap, delay)}>
      {children}
    </Tag>
  );
}

export function Item({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' | 'span' }) {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag className={className} variants={fadeUp}>
      {children}
    </Tag>
  );
}
