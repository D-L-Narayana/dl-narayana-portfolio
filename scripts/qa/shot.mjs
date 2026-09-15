// Quick capture: node scripts/qa/shot.mjs <base> <outDir> "route|width|theme|mode|scrollY"
// mode: view (viewport), full (scroll through then full-page), at (scroll to Y and capture viewport)
import { chromium } from 'playwright';
const [, , base, outDir, ...routes] = process.argv;
const browser = await chromium.launch();
for (const spec of routes) {
  const [route, w = '1440', theme = 'dark', mode = 'view', scrollY = '0'] = spec.split('|');
  const width = Number(w);
  const height = width < 500 ? 812 : width > 2000 ? 1200 : 900;
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, colorScheme: theme, isMobile: width < 500, hasTouch: width < 500, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 160)));
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  if (mode === 'full') {
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += height * 0.8) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(220);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
  } else if (mode === 'at') {
    await page.evaluate((yy) => window.scrollTo(0, yy), Number(scrollY));
    await page.waitForTimeout(1400);
  }
  const name = `${route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-')}-${width}-${theme}${mode === 'full' ? '-full' : mode === 'at' ? `-y${scrollY}` : ''}`;
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: mode === 'full' });
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth, document.documentElement.scrollHeight]);
  console.log(name, 'scrollW/clientW/h', sw.join('/'), errors.length ? 'ERRORS: ' + errors.join(' | ') : 'ok');
  await ctx.close();
}
await browser.close();
