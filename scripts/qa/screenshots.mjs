// QA screenshots: scrolls each route step by step (so in-view animations fire), then captures a
// full-page shot per width and theme. Also logs console errors, failed requests and horizontal
// overflow. Usage: node scripts/qa/screenshots.mjs <round> [base=http://127.0.0.1:3210]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [, , round = 'r0', base = 'http://127.0.0.1:3210'] = process.argv;
const outDir = path.resolve('qa/shots', round);
fs.mkdirSync(outDir, { recursive: true });

const routes = ['/', '/work/', '/work/lakeflow-cdc-pipeline/', '/work/staynest/', '/about/', '/github/', '/contact/', '/nope/'];
const widths = [1440, 1024, 768, 375];
const heights = { 1440: 900, 1024: 768, 768: 1024, 375: 812 };
const themes = { '/': ['dark', 'light'], '/work/': ['dark', 'light'], '/work/lakeflow-cdc-pipeline/': ['dark', 'light'] };

const browser = await chromium.launch();
const report = [];
for (const route of routes) {
  for (const w of widths) {
    for (const theme of themes[route] ?? ['dark']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: heights[w] }, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500, colorScheme: theme });
      const page = await ctx.newPage();
      const errors = [], failed = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
      page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 200)));
      page.on('requestfailed', (r) => failed.push(r.url()));
      page.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
      await page.goto(base + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += heights[w] * 0.8) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(260);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const wide = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.right > doc.clientWidth + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed') wide.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}:${Math.round(r.right - doc.clientWidth)}px`);
        }
        return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, wide: wide.slice(0, 6) };
      });
      const name = `${route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-')}-${w}-${theme}`;
      await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
      report.push({ route, w, theme, total, errors, failed, overflow });
      console.log(name, `h=${total}`, errors.length ? `ERRORS:${errors.length}` : '', failed.length ? `FAILED:${failed.length}` : '', overflow.scrollWidth > overflow.clientWidth ? `OVERFLOW ${overflow.scrollWidth}>${overflow.clientWidth} ${overflow.wide.join(' ')}` : '');
      await ctx.close();
    }
  }
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
const bad = report.filter((r) => r.errors.length || r.failed.length || r.overflow.scrollWidth > r.overflow.clientWidth);
console.log(`\n${report.length} captures, ${bad.length} with issues`);
for (const b of bad) console.log(' -', b.route, b.w, b.theme, b.errors, b.failed, b.overflow.wide);
