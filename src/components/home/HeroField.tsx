'use client';

import { cancelFrame, frame } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { PipelineCanvas } from './PipelineCanvas';

export const GATES = [0.3, 0.55, 0.8];
export const GATE_LABELS = ['Bronze', 'Silver', 'Gold'];

/* ------------------------------------------------------------------------------------------------
 * The hero instrument, GPU edition. Every particle is a CDC event: it enters on the left, crosses the
 * Bronze / Silver / Gold gates (warming in colour at each), and a small share is diverted to
 * quarantine at the Silver gate — it sinks and fades. Positions are computed analytically in the
 * vertex shader from (seed, lane, speed, depth, time), so there is no simulation state, no textures
 * and no per-frame CPU work beyond a handful of uniforms. Three passes with a small time offset give
 * each event a comet tail. Pointer proximity pushes events aside; depth gives the field parallax.
 * Raw WebGL1, ~6 KB of code. Falls back to the Canvas 2D stream when WebGL is unavailable and to a
 * single static frame under prefers-reduced-motion.
 * ---------------------------------------------------------------------------------------------- */

const VERT = `
precision highp float;
attribute vec4 aSeed;   // seed, lane, speed, depth
attribute vec2 aFlag;   // quarantine (0/1), phase
uniform float uTime;
uniform float uOffset;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform float uPointerOn;
uniform float uDpr;
varying float vStage;
varying float vAlpha;
varying float vQ;
varying float vDepth;
void main() {
  float t = uTime - uOffset;
  float speed = 0.045 + aSeed.z * 0.085;
  float x = fract(aSeed.x + t * speed);
  float depth = aSeed.w;
  float wob = sin(t * 0.7 + aFlag.y * 6.2831 + x * 9.0) * 0.007 * (0.4 + depth);
  float y = aSeed.y + wob;
  float stage = step(0.3, x) + step(0.55, x) + step(0.8, x);
  float alpha = 0.32 + 0.68 * depth;
  if (aFlag.x > 0.5 && x > 0.55) {
    float k = (x - 0.55) / 0.45;
    y += k * k * 0.55;
    alpha *= max(0.0, 1.0 - k * 1.7);
  }
  vec2 p = vec2(x, y);
  // pointer repulsion, aspect-corrected
  vec2 d = p - uPointer;
  d.x *= uRes.x / uRes.y;
  float dist = length(d) + 1e-4;
  float push = smoothstep(0.22, 0.0, dist) * 0.07 * uPointerOn * (0.5 + depth);
  p += (d / dist) * push * vec2(uRes.y / uRes.x, 1.0);
  // parallax by depth
  p += (uPointer - 0.5) * (depth - 0.5) * 0.035 * uPointerOn;
  gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  float size = 1.6 + depth * 2.6 + step(2.5, stage) * 1.6;
  gl_PointSize = size * uDpr;
  vStage = stage;
  vAlpha = alpha;
  vQ = aFlag.x;
  vDepth = depth;
}`;

const FRAG = `
precision mediump float;
uniform vec3 uC0; // faint
uniform vec3 uC1; // warm
uniform vec3 uC2; // bright
uniform vec3 uC3; // accent
uniform float uGain;
varying float vStage;
varying float vAlpha;
varying float vQ;
varying float vDepth;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c) * 2.0;
  float disc = smoothstep(1.0, 0.35, r);
  vec3 col = uC0;
  if (vQ < 0.5) {
    if (vStage > 0.5) col = uC1;
    if (vStage > 1.5) col = uC2;
    if (vStage > 2.5) col = uC3;
  }
  float a = disc * vAlpha * uGain;
  gl_FragColor = vec4(col, a);
}`;

function hexToRgb01(hex: string, fb: [number, number, number]): [number, number, number] {
  const h = hex.trim().replace('#', '');
  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(h)) return fb;
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
  return sh;
}

export function HeroField({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<'gl' | 'canvas' | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || c.getContext('experimental-webgl');
      setMode(gl ? 'gl' : 'canvas');
    } catch {
      setMode('canvas');
    }
  }, []);
  if (mode === 'canvas') return <PipelineCanvas className={className} />;
  if (mode === 'gl') return <GLField className={className} />;
  return <div className={className} aria-hidden="true" />;
}

function GLField({ className }: { className: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const gl = (canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' }) as WebGLRenderingContext | null) || null;
    if (!gl) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
    } catch {
      return;
    }
    gl.useProgram(prog);

    // ---- geometry: one vertex per event -------------------------------------------------------
    const isSmall = window.innerWidth < 640;
    const isMid = window.innerWidth < 1024;
    const N = isSmall ? 1400 : isMid ? 2600 : 4200;
    const seeds = new Float32Array(N * 4);
    const flags = new Float32Array(N * 2);
    let s = 1234567;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < N; i++) {
      seeds[i * 4] = rnd(); // seed / phase along x
      seeds[i * 4 + 1] = 0.16 + rnd() * 0.62; // lane
      seeds[i * 4 + 2] = rnd(); // speed factor
      seeds[i * 4 + 3] = Math.pow(rnd(), 1.6); // depth (more far particles than near)
      flags[i * 2] = rnd() < 0.07 ? 1 : 0; // quarantine
      flags[i * 2 + 1] = rnd(); // wobble phase
    }
    const bufSeed = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufSeed);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    const aSeed = gl.getAttribLocation(prog, 'aSeed');
    gl.enableVertexAttribArray(aSeed);
    gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 0, 0);
    const bufFlag = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufFlag);
    gl.bufferData(gl.ARRAY_BUFFER, flags, gl.STATIC_DRAW);
    const aFlag = gl.getAttribLocation(prog, 'aFlag');
    gl.enableVertexAttribArray(aFlag);
    gl.vertexAttribPointer(aFlag, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uTime = U('uTime'), uOffset = U('uOffset'), uRes = U('uRes'), uPointer = U('uPointer'), uPointerOn = U('uPointerOn'), uDpr = U('uDpr'), uGain = U('uGain');
    const uC = [U('uC0'), U('uC1'), U('uC2'), U('uC3')];

    // ---- theme colours -------------------------------------------------------------------------
    let dark = true;
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      dark = document.documentElement.getAttribute('data-theme') !== 'light';
      const get = (n: string, fb: [number, number, number]) => hexToRgb01(cs.getPropertyValue(n), fb);
      const faint = get('--text-faint', [0.54, 0.51, 0.47]);
      const muted = get('--text-muted', [0.65, 0.63, 0.58]);
      const text = get('--text', [0.93, 0.91, 0.87]);
      const accent = get('--accent', [0.95, 0.72, 0.29]);
      const cols: [number, number, number][] = dark
        ? [mix(faint, [0, 0, 0], 0.15), mix(faint, accent, 0.4), mix(muted, text, 0.55), accent]
        : [mix(faint, [1, 1, 1], 0.15), mix(muted, accent, 0.5), mix(muted, [0.1, 0.09, 0.07], 0.35), accent];
      cols.forEach((c, i) => gl.uniform3f(uC[i], c[0], c[1], c[2]));
      // additive glow on ink, normal blending on paper
      if (dark) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    };
    gl.enable(gl.BLEND);
    readColors();
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ---- sizing -----------------------------------------------------------------------------------
    let w = 1, h = 1, dpr = 1;
    const resize = () => {
      const b = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(b.width));
      h = Math.max(1, Math.round(b.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uDpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) drawFrame(12);
    });
    ro.observe(wrap);

    // ---- pointer ----------------------------------------------------------------------------------
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, ton: 0 };
    const onMove = (e: PointerEvent) => {
      const b = wrap.getBoundingClientRect();
      pointer.tx = (e.clientX - b.left) / Math.max(1, b.width);
      pointer.ty = (e.clientY - b.top) / Math.max(1, b.height);
      pointer.ton = pointer.tx >= -0.05 && pointer.tx <= 1.05 && pointer.ty >= -0.05 && pointer.ty <= 1.05 ? 1 : 0;
    };
    const onLeave = () => (pointer.ton = 0);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    // ---- loop -----------------------------------------------------------------------------------------
    let inView = true, running = true;
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: '5%' });
    io.observe(wrap);
    const onVis = () => (running = document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);

    const passes: [number, number][] = [
      [0.16, 0.16],
      [0.08, 0.32],
      [0, 1],
    ];
    const drawFrame = (t: number) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uPointerOn, pointer.on);
      for (const [off, gain] of passes) {
        gl.uniform1f(uOffset, off);
        gl.uniform1f(uGain, gain * (dark ? 1 : 0.9));
        gl.drawArrays(gl.POINTS, 0, N);
      }
    };

    let time = 12;
    const tick = ({ delta }: { delta: number }) => {
      if (!running || !inView) return;
      const dt = Math.min(delta || 16.7, 40) / 1000;
      time += dt;
      const k = 1 - Math.exp(-dt * 6);
      pointer.x += (pointer.tx - pointer.x) * k;
      pointer.y += (pointer.ty - pointer.y) * k;
      pointer.on += (pointer.ton - pointer.on) * k;
      drawFrame(time);
    };

    let started = false;
    let idleId = 0, timeoutId = 0;
    const begin = () => {
      if (started) return;
      started = true;
      frame.update(tick, true);
    };
    drawFrame(time);
    if (!reduce) {
      const win = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
      if (document.readyState === 'complete') idleId = win.requestIdleCallback ? win.requestIdleCallback(begin, { timeout: 900 }) : window.setTimeout(begin, 200);
      else window.addEventListener('load', () => (timeoutId = window.setTimeout(begin, 150)), { once: true });
    }

    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      cancelFrame(tick);
      window.clearTimeout(timeoutId);
      const win = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      gl.deleteBuffer(bufSeed);
      gl.deleteBuffer(bufFlag);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <div ref={wrapRef} className={className || 'relative'}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <p className="sr-only">Animated illustration: thousands of change-data-capture events streaming through Bronze, Silver and Gold layers; a few rows are diverted to quarantine.</p>
    </div>
  );
}
