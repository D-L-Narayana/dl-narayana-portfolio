// Interaction-state captures (viewport only): cursor idle/magnetic/view/text states, nav pill,
// mobile menu, theme toggle, work filters, focus ring, 404. Usage: node scripts/qa/states.mjs <round>
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [, , round = 'r0', base = 'http://127.0.0.1:3210'] = process.argv;
const outDir = path.resolve('qa/shots', round);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const shot = (page, name) => page.screenshot({ path: path.join(outDir, `STATE-${name}.png`) });

// Desktop states
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.mouse.move(700, 500, { steps: 10 });
  await page.waitForTimeout(400);
  await shot(page, 'cursor-default');
  const btn = await page.locator('.btn-primary').first().boundingBox();
  await page.mouse.move(btn.x + btn.width / 2 - 10, btn.y + btn.height / 2, { steps: 15 });
  await page.waitForTimeout(500);
  await shot(page, 'cursor-magnetic-button');
  const nav = await page.locator('nav a', { hasText: 'About' }).boundingBox();
  await page.mouse.move(nav.x + nav.width / 2, nav.y + nav.height / 2, { steps: 12 });
  await page.waitForTimeout(400);
  await shot(page, 'cursor-nav');
  const lead = await page.locator('.lead').first().boundingBox();
  await page.mouse.move(lead.x + 80, lead.y + 20, { steps: 10 });
  await page.waitForTimeout(400);
  await shot(page, 'cursor-text');
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(900);
  const media = await page.locator('[data-cursor="view"]').first().boundingBox();
  if (media) {
    await page.mouse.move(media.x + media.width / 2, media.y + media.height / 2, { steps: 14 });
    await page.waitForTimeout(600);
    await shot(page, 'cursor-view-card');
  }
  // keyboard focus ring
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  await shot(page, 'focus-ring');
  // theme toggle
  await page.click('button[aria-label^="Switch to"]');
  await page.waitForTimeout(600);
  await shot(page, 'theme-toggled-light');
  // route transition mid-way
  await page.click('nav a[href="/work/"]');
  await page.waitForTimeout(230);
  await shot(page, 'route-curtain');
  await page.waitForTimeout(1500);
  await shot(page, 'work-after-transition');
  // filter interaction
  await page.click('button[role="tab"]:has-text("AI")');
  await page.waitForTimeout(700);
  await shot(page, 'work-filter-ai');
  await ctx.close();
}
// Mobile states
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot(page, 'mobile-hero');
  const skip = await page.evaluate(() => { const r = document.querySelector('.skip-link').getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
  console.log('skip-link rect (should be off-screen):', skip);
  const hasCursor = await page.evaluate(() => !!document.querySelector('.cursor-root'));
  console.log('custom cursor mounted on touch device (should be false):', hasCursor);
  await page.click('button[aria-controls="mobile-menu"]');
  await page.waitForTimeout(700);
  await shot(page, 'mobile-menu-open');
  await ctx.close();
}
// Reduced motion
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => ({ cursor: !!document.querySelector('.cursor-root'), lenis: document.documentElement.classList.contains('lenis'), heroOpacity: getComputedStyle(document.querySelector('h1 span span')).transform }));
  console.log('reduced motion → cursor mounted:', info.cursor, '| lenis active:', info.lenis, '| hero word transform:', info.heroOpacity);
  await shot(page, 'reduced-motion-hero');
  await ctx.close();
}
await browser.close();
console.log('states done');
