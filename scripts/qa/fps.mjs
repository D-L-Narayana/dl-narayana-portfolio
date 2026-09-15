// FPS instrumentation: rAF frame timing + PerformanceObserver long tasks + CDP tracing while
// (1) wheel-scrolling through the home page (Lenis smoothing + scroll-linked motion) and
// (2) sweeping the pointer over magnetic/hover targets (custom cursor + springs).
// Usage: node scripts/qa/fps.mjs [base=http://127.0.0.1:3210] [route=/]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [, , base = 'http://127.0.0.1:3210', route = '/'] = process.argv;
const browser = await chromium.launch({ args: ['--disable-frame-rate-limit=false'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const client = await ctx.newCDPSession(page);
await page.goto(base + route, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const start = () =>
  page.evaluate(() => {
    const w = window;
    w.__frames = [];
    w.__long = [];
    w.__run = true;
    const loop = (t) => {
      w.__frames.push(t);
      if (w.__run) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    try {
      w.__po = new PerformanceObserver((list) => list.getEntries().forEach((e) => w.__long.push(e.duration)));
      w.__po.observe({ type: 'longtask', buffered: false });
    } catch {}
  });

const stop = () =>
  page.evaluate(() => {
    const w = window;
    w.__run = false;
    w.__po?.disconnect();
    const f = w.__frames;
    const d = [];
    for (let i = 1; i < f.length; i++) d.push(f[i] - f[i - 1]);
    d.sort((a, b) => a - b);
    const sum = d.reduce((a, b) => a + b, 0);
    const p = (q) => d[Math.min(d.length - 1, Math.floor(q * d.length))];
    return {
      frames: d.length,
      seconds: sum / 1000,
      avgFps: d.length / (sum / 1000),
      p50ms: p(0.5),
      p95ms: p(0.95),
      p99ms: p(0.99),
      onePercentLowFps: 1000 / p(0.99),
      droppedFrames: d.filter((x) => x > 16.7 * 1.5).length,
      longTasks: w.__long.length,
      longestTaskMs: Math.max(0, ...w.__long),
    };
  });

async function traced(label, fn) {
  const events = [];
  client.on('Tracing.dataCollected', (e) => events.push(...e.value));
  await client.send('Tracing.start', { traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline.frame'] }, transferMode: 'ReportEvents' });
  await start();
  await fn();
  const stats = await stop();
  const done = new Promise((res) => client.once('Tracing.tracingComplete', res));
  await client.send('Tracing.end');
  await done;
  const draw = events.filter((e) => e.name === 'DrawFrame').length;
  const longRun = events.filter((e) => e.name === 'RunTask' && e.dur > 50000).length;
  const layouts = events.filter((e) => e.name === 'Layout').length;
  const styles = events.filter((e) => e.name === 'UpdateLayoutTree').length;
  const byName = {};
  for (const e of events) if (e.dur) byName[e.name] = (byName[e.name] || 0) + e.dur / 1000;
  const top = Object.entries(byName).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, ms]) => `${n} ${ms.toFixed(0)}ms`);
  return { label, ...stats, trace: { drawFrames: draw, tasksOver50ms: longRun, layouts, styleRecalcs: styles, events: events.length, topByDuration: top } };
}

const scroll = await traced('scroll (wheel, 1440×900)', async () => {
  await page.mouse.move(720, 450);
  for (let i = 0; i < 70; i++) {
    await page.mouse.wheel(0, 140);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(900);
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, -220);
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(700);
});

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
const hover = await traced('hover sweep (nav, buttons, cards)', async () => {
  const targets = await page.evaluate(() =>
    [...document.querySelectorAll('nav a, .btn, [data-cursor="view"], [data-cursor="magnetic"], h1, p')]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.top >= 0 && r.bottom <= innerHeight)
      .slice(0, 14)
      .map((r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })),
  );
  for (let pass = 0; pass < 2; pass++) {
    for (const t of targets) {
      await page.mouse.move(t.x, t.y, { steps: 12 });
      await page.mouse.move(t.x + 18, t.y + 6, { steps: 6 });
      await page.waitForTimeout(90);
    }
  }
});

const result = { url: base + route, when: new Date().toISOString(), note: 'Headless Chromium, software rendering (no GPU) — real hardware is faster.', scroll, hover };
fs.mkdirSync('qa', { recursive: true });
fs.writeFileSync(path.join('qa', `fps-${route === '/' ? 'home' : route.replace(/\W+/g, '')}.json`), JSON.stringify(result, null, 2));
for (const r of [scroll, hover]) console.log(`${r.label}: avg ${r.avgFps.toFixed(1)} fps · 1% low ${r.onePercentLowFps.toFixed(1)} fps · p95 ${r.p95ms.toFixed(1)}ms · dropped ${r.droppedFrames}/${r.frames} · long tasks ${r.longTasks} (max ${r.longestTaskMs.toFixed(0)}ms) · trace: ${JSON.stringify(r.trace)}`);
await browser.close();
