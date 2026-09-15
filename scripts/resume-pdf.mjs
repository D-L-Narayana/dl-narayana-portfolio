// Prints /resume/ from the static build to public/D-L-Narayana-Resume.pdf (and into out/ when
// present) so the PDF can never drift from the page. Usage: node scripts/resume-pdf.mjs [base]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:3210';
const browser = await chromium.launch();
const ctx = await browser.newContext({ colorScheme: 'light', reducedMotion: 'reduce', viewport: { width: 1200, height: 1600 } });
const page = await ctx.newPage();
await page.goto(`${base}/resume/`, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print', colorScheme: 'light' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
const targets = ['public/D-L-Narayana-Resume.pdf', 'out/D-L-Narayana-Resume.pdf'].filter((t) => t.startsWith('public') || fs.existsSync(path.dirname(t)));
for (const t of targets) fs.writeFileSync(t, pdf);
console.log(`resume-pdf: ${(pdf.length / 1024).toFixed(0)} KB → ${targets.join(', ')}`);
