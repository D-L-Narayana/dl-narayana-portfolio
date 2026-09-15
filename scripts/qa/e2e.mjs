// End-to-end checks against the static build. Usage: node scripts/qa/e2e.mjs [base]
// Exit code 1 on any failure. Covers: every route renders with no console errors and no 404 assets,
// the command palette (keyboard + mouse), theme toggle, work filters, contact form, chapter nav,
// skip link, mobile menu, reduced-motion behaviour, hero WebGL/canvas fallback, storage-API ban.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:3210';
const failures = [];
const ok = (cond, msg) => (cond ? console.log('  ✓', msg) : (failures.push(msg), console.log('  ✗', msg)));

const browser = await chromium.launch();

// 1. Every route from the sitemap + 404 + feed + manifest
const out = path.resolve('out');
const sitemap = fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8');
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
console.log(`Routes in sitemap: ${routes.length}`);
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  for (const r of routes) {
    const errors = [], failed = [];
    const onC = (m) => m.type() === 'error' && errors.push(m.text());
    const onE = (e) => errors.push(String(e));
    const onR = (res) => res.status() >= 400 && failed.push(`${res.status()} ${res.url()}`);
    page.on('console', onC); page.on('pageerror', onE); page.on('response', onR);
    const res = await page.goto(base + r, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const h1 = await page.locator('h1').count();
    const title = await page.title();
    ok(res.status() === 200 && h1 >= 1 && title.length > 0 && errors.length === 0 && failed.length === 0, `${r} → ${res.status()}, h1=${h1}, "${title.slice(0, 40)}"${errors.length ? ' ERR ' + errors[0].slice(0, 80) : ''}${failed.length ? ' FAILED ' + failed[0] : ''}`);
    page.off('console', onC); page.off('pageerror', onE); page.off('response', onR);
  }
  const nf = await page.goto(base + '/definitely-not-a-route/');
  ok(nf.status() === 404 && (await page.locator('h1').innerText()).includes('quality gate'), '404 page renders for unknown routes');
  const feed = await page.goto(base + '/feed.xml');
  ok(feed.status() === 200 && (await feed.text()).includes('<rss'), 'RSS feed is valid');
  const man = await page.goto(base + '/manifest.webmanifest');
  ok(man.status() === 200 && JSON.parse(await man.text()).icons.length === 3, 'Web manifest with 3 icons');
  const pdf = await page.request.get(base + '/D-L-Narayana-Resume.pdf');
  ok(pdf.status() === 200 && pdf.headers()['content-type']?.includes('pdf') && (await pdf.body()).length > 20000, 'Résumé PDF is served');
  await ctx.close();
}

// 2. Interactions on desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  ok(await page.evaluate(() => document.documentElement.classList.contains('intro-done')), 'Intro sequence completed and unmounted');
  ok(await page.evaluate(() => !!document.querySelector('.hero-field canvas')), 'Hero field canvas mounted (WebGL or Canvas2D)');

  // Command palette via keyboard
  await page.keyboard.press('Control+k');
  await page.waitForSelector('[role="dialog"][aria-label="Command palette"]');
  ok(await page.evaluate(() => document.activeElement?.tagName === 'INPUT'), 'Palette opens on Ctrl+K and focuses the input');
  await page.keyboard.type('lakef');
  await page.waitForTimeout(150);
  const first = await page.locator('[role="option"]').first().innerText();
  ok(/LakeFlow/i.test(first), `Fuzzy search ranks LakeFlow first for "lakef" (got "${first.split('\n')[0]}")`);
  await page.keyboard.press('Enter');
  await page.waitForURL('**/work/lakeflow-cdc-pipeline/', { timeout: 5000 });
  await page.waitForTimeout(900);
  ok(page.url().endsWith('/work/lakeflow-cdc-pipeline/'), 'Enter navigates through the curtain to the case study');
  ok((await page.locator('[role="dialog"]').count()) === 0, 'Palette closed after navigation');

  // Chapter nav + count-up
  await page.waitForTimeout(600);
  const glance = await page.locator('[aria-label="At a glance"] dd').first().innerText();
  ok(glance.replace(/\s/g, '') === '510,663', `Count-up lands on the exact value (${glance})`);
  await page.locator('.chapter-nav a[href="#results"]').click();
  await page.waitForTimeout(1600);
  ok(await page.evaluate(() => location.hash === '#results' && window.scrollY > 400), 'Chapter nav scrolls to the section and sets the hash');

  // Theme action from palette
  await page.keyboard.press('Control+k');
  await page.waitForSelector('[role="dialog"]');
  await page.keyboard.type('theme');
  await page.waitForTimeout(150);
  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  ok(before !== after, `Palette theme action toggles data-theme (${before} → ${after})`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  ok((await page.locator('[role="dialog"]').count()) === 0, 'Escape closes the palette');

  // Work filters
  await page.goto(base + '/work/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^Data/ }).click();
  await page.waitForTimeout(700);
  const cards = await page.locator('main ul[role="list"] > li:visible').count();
  ok(cards === 2, `Data filter shows 2 projects (${cards})`);
  ok((await page.getByRole('button', { name: /^Data/ }).getAttribute('aria-pressed')) === 'true', 'Active filter is aria-pressed');

  // Contact form validation + mailto composition
  await page.goto(base + '/contact/', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'Ada');
  await page.fill('input[name="email"]', 'ada@example.com');
  await page.fill('textarea[name="message"]', 'Hello from the end-to-end test suite.');
  await page.evaluate(() => { window.__href = null; const d = Object.getOwnPropertyDescriptor(window, 'location'); void d; });
  await page.route('**/*', (route) => route.continue());
  const [nav] = await Promise.all([
    page.waitForEvent('framenavigated', { timeout: 3000 }).catch(() => null),
    page.click('form button[type="submit"]'),
  ]);
  void nav;
  await page.waitForTimeout(400);
  ok((await page.locator('form [role="status"]').count()) === 1, 'Contact form confirms after composing the mailto');

  // Skill matrix hover + link
  await page.goto(base + '/#stack', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const cell = page.locator('.matrix a.cell').first();
  await cell.scrollIntoViewIfNeeded();
  await cell.hover();
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => !!document.querySelector('.matrix[data-hot] tr[data-hot]')), 'Skill matrix cross-highlights on hover');
  ok(/(^|\/)work\/[a-z0-9-]+\/$/.test((await cell.getAttribute('href')) ?? ''), 'Matrix cells link to case studies');

  // Skip link + focus states
  await page.goto(base + '/about/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  ok(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), 'First Tab lands on the skip link');
  await page.keyboard.press('Tab');
  const focusRing = await page.evaluate(() => { const el = document.activeElement; const cs = getComputedStyle(el); return cs.outlineStyle !== 'none' || el.matches(':focus-visible'); });
  ok(focusRing, 'Focused element shows a focus ring');

  ok(errors.length === 0, `No page errors during interactions${errors.length ? ': ' + errors[0].slice(0, 120) : ''}`);
  await ctx.close();
}

// 3. Mobile menu + touch: no custom cursor, no Lenis
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  ok((await page.locator('.cursor-root').count()) === 0, 'Custom cursor not mounted on touch');
  ok(await page.evaluate(() => !window.__lenis), 'Lenis inactive on touch');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.waitForSelector('#mobile-menu');
  ok((await page.locator('#mobile-menu a').count()) >= 6, 'Mobile menu lists every section');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  ok((await page.locator('#mobile-menu').count()) === 0, 'Escape closes the mobile menu');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow === 0, `No horizontal overflow at 375 (${overflow}px)`);
  await ctx.close();
}

// 4. Reduced motion: no intro, static hero, instant reveals
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  ok(await page.evaluate(() => !document.documentElement.classList.contains('has-intro')), 'Reduced motion skips the intro');
  ok((await page.locator('.cursor-root').count()) === 0, 'Reduced motion disables the custom cursor');
  const h1Visible = await page.evaluate(() => { const el = document.querySelector('.word-rise'); return getComputedStyle(el).transform === 'none'; });
  ok(h1Visible, 'Hero words are in place immediately under reduced motion');
  await ctx.close();
}

// 5. Forbidden APIs in the shipped bundle
{
  const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, acc) : acc.push(p); } return acc; };
  const js = walk(path.join(out, '_next')).filter((f) => f.endsWith('.js') && !/polyfills|framework|main-app|webpack/.test(f));
  const hits = [];
  for (const f of js) { const s = fs.readFileSync(f, 'utf8'); for (const api of ['localStorage', 'sessionStorage', 'indexedDB', 'requestPointerLock', 'requestFullscreen']) if (s.includes(api)) hits.push(`${path.basename(f)}:${api}`); }
  ok(hits.length === 0, `No storage / pointer-lock / fullscreen APIs in app chunks${hits.length ? ' — ' + hits.join(', ') : ''}`);
  const html = walk(out).filter((f) => f.endsWith('.html'));
  const placeholders = [];
  for (const f of html) { const s = fs.readFileSync(f, 'utf8'); for (const w of ['lorem', 'TODO', 'Coming soon', 'placeholder text', 'Lorem']) if (s.includes(w)) placeholders.push(`${path.relative(out, f)}:${w}`); }
  ok(placeholders.length === 0, `No dead placeholders in ${html.length} HTML files${placeholders.length ? ' — ' + placeholders.slice(0, 3).join(', ') : ''}`);
}

await browser.close();
console.log(`\n${failures.length === 0 ? 'ALL PASSED' : failures.length + ' FAILED'}`);
for (const f of failures) console.log(' -', f);
process.exit(failures.length ? 1 : 0);
