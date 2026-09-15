'use client';

import { cancelFrame, frame } from 'motion';
import { useEffect, useRef, useState } from 'react';

type State = 'default' | 'link' | 'magnetic' | 'view' | 'drag' | 'external' | 'text' | 'hidden' | 'native';

const LABEL: Partial<Record<State, string>> = { view: 'View', drag: 'Drag', external: 'Open ↗' };
const SIZE: Record<State, [number, number]> = {
  default: [36, 36],
  link: [52, 52],
  magnetic: [52, 52],
  view: [92, 92],
  drag: [92, 92],
  external: [84, 84],
  text: [3, 30],
  hidden: [36, 36],
  native: [36, 36],
};
const BASE = 100; // SVG viewBox units; the ring is only ever scaled, never resized.

/** Gate: fine pointer + hover + no reduced-motion. Touch devices never mount the cursor. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const check = () => setEnabled(fine.matches && !reduce.matches);
    check();
    fine.addEventListener('change', check);
    reduce.addEventListener('change', check);
    return () => {
      fine.removeEventListener('change', check);
      reduce.removeEventListener('change', check);
    };
  }, []);
  return enabled ? <CursorInner /> : null;
}

/**
 * Two layers: a 6px dot (tight exponential follow, difference-blend) and an SVG ring driven by
 * damped springs for position and size. The ring is a 100×100 SVG that is *scaled* to its target
 * size — width/height never change, the stroke is non-scaling, and rx/ry are corrected per axis so a
 * magnetic snap to a rectangular button morphs into a true rounded rectangle. Everything runs inside
 * Motion's shared frame loop and writes transform/opacity (plus two SVG attributes) only.
 */
function CursorInner() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const rect = rectRef.current!;
    const labelWrap = labelRef.current!;
    const labelText = labelTextRef.current!;
    const html = document.documentElement;
    html.classList.add('has-cursor');

    const p = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
    const d = { x: p.x, y: p.y };
    const r = { x: p.x, y: p.y, vx: 0, vy: 0, w: 36, h: 36, vw: 0, vh: 0, radius: 50, o: 0, press: 1 };
    let state: State = 'default';
    let magnet: HTMLElement | null = null;
    let magnetRadius = 999;
    let visible = false;
    let lastRx = -1, lastRy = -1;

    const setState = (s: State) => {
      if (s === state) return;
      state = s;
      ring.dataset.state = s;
      labelWrap.dataset.state = s;
      labelText.textContent = LABEL[s] ?? '';
    };

    const classify = (target: Element | null): State => {
      if (!target) return 'default';
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return 'native';
      const tagged = target.closest<HTMLElement>('[data-cursor]');
      if (tagged) {
        const v = tagged.dataset.cursor || '';
        if (v.includes('magnetic')) {
          magnet = tagged;
          magnetRadius = parseFloat(getComputedStyle(tagged).borderTopLeftRadius) || 0;
          return 'magnetic';
        }
        if (v === 'hidden') return 'hidden';
        if (v === 'view' || v === 'drag' || v === 'external' || v === 'text') return v;
      }
      const a = target.closest<HTMLAnchorElement>('a[href]');
      if (a && /^https?:/.test(a.href) && !a.href.startsWith(location.origin)) return 'external';
      if (target.closest('a, button, [role="button"], summary, label')) return 'link';
      if (target.closest('p, h1, h2, h3, h4, li, blockquote, dd, dt, .prose, .lead')) return 'text';
      return 'default';
    };

    const onMove = (e: PointerEvent) => {
      p.x = e.clientX;
      p.y = e.clientY;
      if (!p.seen) {
        p.seen = true;
        d.x = r.x = p.x;
        d.y = r.y = p.y;
      }
      visible = true;
      magnet = null;
      setState(classify(e.target as Element));
    };
    const onLeave = () => {
      visible = false;
    };
    const onDown = () => {
      r.press = 0.86;
    };
    const onUp = () => {
      r.press = 1;
    };
    addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    addEventListener('pointerdown', onDown, { passive: true });
    addEventListener('pointerup', onUp, { passive: true });
    addEventListener('blur', onLeave);

    // Semi-implicit Euler spring, unit mass. k = stiffness, c = damping.
    const spring = (x: number, v: number, target: number, k: number, c: number, dt: number) => {
      v += (k * (target - x) - c * v) * dt;
      x += v * dt;
      return [x, v] as const;
    };

    const tick = ({ delta }: { delta: number }) => {
      const dt = Math.min(delta || 16.7, 34) / 1000;
      const kd = 1 - Math.exp(-dt * 40);
      d.x += (p.x - d.x) * kd;
      d.y += (p.y - d.y) * kd;

      let tx = p.x, ty = p.y;
      let [tw, th] = SIZE[state];
      let tr = state === 'text' ? 1.5 : 999;
      if (state === 'magnetic' && magnet && magnet.isConnected) {
        const b = magnet.getBoundingClientRect();
        const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        tx = cx + (p.x - cx) * 0.15;
        ty = cy + (p.y - cy) * 0.15;
        tw = b.width + 16;
        th = b.height + 16;
        tr = magnetRadius >= Math.min(b.width, b.height) / 2 ? 999 : magnetRadius + 8;
      }
      [r.x, r.vx] = spring(r.x, r.vx, tx, 280, 30, dt);
      [r.y, r.vy] = spring(r.y, r.vy, ty, 280, 30, dt);
      [r.w, r.vw] = spring(r.w, r.vw, tw, 340, 32, dt);
      [r.h, r.vh] = spring(r.h, r.vh, th, 340, 32, dt);
      const targetRadius = Math.min(tr, Math.min(tw, th) / 2);
      r.radius += (targetRadius - r.radius) * (1 - Math.exp(-dt * 16));

      const wantVisible = visible && p.seen && state !== 'hidden' && state !== 'native';
      r.o += ((wantVisible ? 1 : 0) - r.o) * (1 - Math.exp(-dt * 18));

      const settled = Math.abs(r.vx) + Math.abs(r.vy) + Math.abs(r.vw) + Math.abs(r.vh) < 0.02 && Math.abs(p.x - d.x) + Math.abs(p.y - d.y) < 0.02 && Math.abs((wantVisible ? 1 : 0) - r.o) < 0.002 && state !== 'magnetic';
      if (settled) return;
      const w = Math.max(0.5, r.w), h = Math.max(0.5, r.h);
      const sx = (w / BASE) * r.press, sy = (h / BASE) * r.press;
      dot.style.transform = `translate3d(${d.x}px, ${d.y}px, 0)`;
      dot.style.opacity = String(state === 'text' || state === 'view' || state === 'drag' || state === 'external' ? 0 : r.o);
      ring.style.transform = `translate3d(${r.x - BASE / 2}px, ${r.y - BASE / 2}px, 0) scale(${sx}, ${sy})`;
      ring.style.opacity = String(r.o);
      const rad = Math.min(r.radius, w / 2, h / 2);
      const rx = (rad / w) * BASE, ry = (rad / h) * BASE;
      if (Math.abs(rx - lastRx) > 0.05 || Math.abs(ry - lastRy) > 0.05) {
        lastRx = rx;
        lastRy = ry;
        rect.setAttribute('rx', String(rx));
        rect.setAttribute('ry', String(ry));
      }
      labelWrap.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
      labelWrap.style.opacity = String(r.o);
    };
    frame.update(tick, true);

    return () => {
      cancelFrame(tick);
      removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      removeEventListener('pointerdown', onDown);
      removeEventListener('pointerup', onUp);
      removeEventListener('blur', onLeave);
      html.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div className="cursor-root" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} />
      <svg ref={ringRef} className="cursor-ring" data-state="default" width={BASE} height={BASE} viewBox={`0 0 ${BASE} ${BASE}`} style={{ opacity: 0 }}>
        <rect ref={rectRef} x="0.75" y="0.75" width={BASE - 1.5} height={BASE - 1.5} rx="50" ry="50" vectorEffect="non-scaling-stroke" />
      </svg>
      <div ref={labelRef} className="cursor-label" data-state="default" style={{ opacity: 0 }}>
        <span ref={labelTextRef} />
      </div>
    </div>
  );
}
