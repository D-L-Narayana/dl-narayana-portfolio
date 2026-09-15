'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; label: string };

/** Sticky chapter list; the active chapter follows the reader via one IntersectionObserver. Anchor
 *  clicks go through Lenis (see SmoothScroll) so the scroll is smooth and the hash is preserved. */
export function ChapterNav({ items, label = 'On this page' }: { items: Item[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((x): x is HTMLElement => !!x);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav className="chapter-nav" aria-label={label}>
      <p className="eyebrow mb-3">{label}</p>
      <ul role="list">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? 'true' : undefined}>
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
