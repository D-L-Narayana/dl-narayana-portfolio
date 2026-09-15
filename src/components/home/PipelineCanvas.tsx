'use client';

import { cancelFrame, frame } from 'motion/react';
import { useEffect, useRef } from 'react';

type P = { x: number; y: number; lane: number; speed: number; stage: number; q: number; vy: number; a: number; phase: number };

const GATES = [0.3, 0.55, 0.8];
const LABELS = ['Bronze', 'Silver', 'Gold'];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * The hero instrument: a live CDC stream. Events enter from the left, pass Bronze → Silver → Gold
 * gates (colour warming at each), a small share is diverted to quarantine at the Silver gate and
 * fades out below the rail. Pointer proximity disturbs the stream. Canvas 2D, DPR capped at 1.5,
 * ticked from the shared Motion frame loop, paused off-screen, static under reduced motion.
 */
export function PipelineCanvas({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1;
    let running = true, inView = true;
    const ps: P[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    const counts = { gold: 0, q: 0, lastWrite: 0 };
    const counter = counterRef.current;
    let colors = { bg: [12, 11, 9] as [number, number, number], faint: [131, 124, 112] as [number, number, number], muted: [167, 160, 147] as [number, number, number], text: [237, 232, 223] as [number, number, number], accent: [242, 184, 75] as [number, number, number], border: [39, 36, 31] as [number, number, number] };

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const get = (n: string, fb: [number, number, number]) => {
        const v = cs.getPropertyValue(n).trim();
        return v.startsWith('#') ? hexToRgb(v) : fb;
      };
      colors = { bg: get('--bg', colors.bg), faint: get('--text-faint', colors.faint), muted: get('--text-muted', colors.muted), text: get('--text', colors.text), accent: get('--accent', colors.accent), border: get('--border-strong', colors.border) };
    };
    readColors();
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const spawn = (p: P, fresh = false) => {
      p.x = fresh ? Math.random() : -Math.random() * 0.25;
      p.lane = 0.22 + Math.random() * 0.56;
      p.y = p.lane;
      p.speed = 0.055 + Math.random() * 0.075; // fraction of width per second
      p.stage = fresh ? GATES.filter((g) => g < p.x).length : 0;
      p.q = 0;
      p.vy = 0;
      p.a = 0.55 + Math.random() * 0.45;
      p.phase = Math.random() * Math.PI * 2;
    };

    const resize = () => {
      const b = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(b.width));
      h = Math.max(1, Math.round(b.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = w < 640 ? 80 : w < 1024 ? 150 : 220;
      while (ps.length < target) {
        const p = { x: 0, y: 0, lane: 0, speed: 0, stage: 0, q: 0, vy: 0, a: 1, phase: 0 };
        spawn(p, true);
        ps.push(p);
      }
      ps.length = target;
      ctx.clearRect(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: '10%' });
    io.observe(wrap);
    const onVis = () => (running = document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);

    const onMove = (e: PointerEvent) => {
      const b = wrap.getBoundingClientRect();
      pointer.x = e.clientX - b.left;
      pointer.y = e.clientY - b.top;
      pointer.active = pointer.x >= -40 && pointer.x <= w + 40 && pointer.y >= -40 && pointer.y <= h + 40;
    };
    const onLeave = () => (pointer.active = false);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h);
      drawGates();
      for (const p of ps) drawParticle(p, 0);
    };

    const drawGates = () => {
      ctx.lineWidth = 1;
      for (let i = 0; i < GATES.length; i++) {
        const gx = Math.round(GATES[i] * w) + 0.5;
        ctx.strokeStyle = rgba(i === 2 ? colors.accent : colors.border, i === 2 ? 0.55 : 0.9);
        ctx.beginPath();
        ctx.moveTo(gx, h * 0.12);
        ctx.lineTo(gx, h * 0.88);
        ctx.stroke();
      }
      // rail baseline
      ctx.strokeStyle = rgba(colors.border, 0.5);
      ctx.beginPath();
      ctx.moveTo(0, Math.round(h * 0.5) + 0.5);
      ctx.lineTo(w, Math.round(h * 0.5) + 0.5);
      ctx.stroke();
    };

    const stageColor = (p: P): [number, number, number] => {
      if (p.q) return colors.faint;
      if (p.stage === 0) return colors.faint;
      if (p.stage === 1) return mix(colors.faint, colors.accent, 0.35);
      if (p.stage === 2) return mix(colors.muted, colors.text, 0.5);
      return colors.accent;
    };

    const drawParticle = (p: P, t: number) => {
      const px = p.x * w;
      const py = p.y * h + Math.sin(t * 0.0012 + p.phase) * 3;
      const c = stageColor(p);
      const size = p.stage === 3 ? 2.6 : 2;
      if (p.stage === 3 && !p.q) {
        ctx.fillStyle = rgba(c, 0.12 * p.a);
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = rgba(c, p.a);
      ctx.fillRect(px - size / 2, py - size / 2, size, size);
    };

    let t0 = performance.now();
    const tick = ({ timestamp, delta }: { timestamp: number; delta: number }) => {
      if (!running || !inView) return;
      const dt = Math.min(delta || 16.7, 40) / 1000;
      t0 = timestamp;
      // trail fade
      ctx.fillStyle = rgba(colors.bg, 0.26);
      ctx.fillRect(0, 0, w, h);
      drawGates();
      for (const p of ps) {
        const before = p.x;
        p.x += p.speed * dt;
        // gates
        for (let g = 0; g < GATES.length; g++) {
          if (before < GATES[g] && p.x >= GATES[g]) {
            p.stage = g + 1;
            if (g === 1 && !p.q && Math.random() < 0.06) {
              p.q = 1;
              counts.q++;
            }
            if (g === 2 && !p.q) counts.gold++;
          }
        }
        if (p.q) {
          p.vy += 0.9 * dt;
          p.y += p.vy * dt;
          p.a -= 0.9 * dt;
          if (p.a <= 0 || p.y > 1.05) spawn(p);
        } else {
          // ease back to lane
          p.y += (p.lane - p.y) * (1 - Math.exp(-dt * 3));
        }
        if (pointer.active) {
          const dx = p.x * w - pointer.x, dy = p.y * h - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / 110) * 0.5 * dt;
            p.y += (dy / d) * f;
            p.x += (dx / d) * f * 0.6;
          }
        }
        if (p.x > 1.03) spawn(p);
        drawParticle(p, t0);
      }
      if (counter && timestamp - counts.lastWrite > 160) {
        counts.lastWrite = timestamp;
        counter.textContent = `gold ${counts.gold.toLocaleString('en-US').padStart(6, '0')} · quarantined ${counts.q.toLocaleString('en-US').padStart(4, '0')}`;
      }
    };

    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      frame.update(tick, true);
    };
    let idleId = 0;
    let timeoutId = 0;
    if (reduce) {
      drawStatic();
    } else {
      // Paint one static frame immediately, start the loop once the page is idle so hydration and
      // the LCP never compete with the animation.
      drawStatic();
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
      if (document.readyState === 'complete') {
        idleId = w.requestIdleCallback ? w.requestIdleCallback(begin, { timeout: 1200 }) : window.setTimeout(begin, 300);
      } else {
        window.addEventListener('load', () => (timeoutId = window.setTimeout(begin, 250)), { once: true });
      }
    }

    return () => {
      cancelFrame(tick);
      window.clearTimeout(timeoutId);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
      <p className="sr-only">Animated illustration: a stream of change-data-capture events flowing through Bronze, Silver and Gold layers, with a few rows diverted to quarantine.</p>
      {GATES.map((g, i) => (
        <span key={g} className={`eyebrow absolute top-1 -translate-x-1/2 ${i === 2 ? 'text-accent' : ''}`} style={{ left: `${g * 100}%` }} aria-hidden>
          {LABELS[i]}
        </span>
      ))}
      <span className="eyebrow absolute bottom-1 left-0" aria-hidden>
        Postgres → Debezium → Kafka → Spark
      </span>
      <span ref={counterRef} className="eyebrow tabular absolute bottom-1 right-0 hidden sm:block" aria-hidden>
        gold 000000 · quarantined 0000
      </span>
    </div>
  );
}
