// Captures real screenshots of the live deployments listed in the GitHub data (homepage URLs).
// Output: assets/raw-screenshots/<slug>.png (1440x900, DPR 1). Failures are reported, not faked.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const targets = {
  resumeforge: 'https://resumeforge-ruby-rho.vercel.app',
  docuforge: 'https://docuforge-brown.vercel.app',
  'veridoc-studio': 'https://veridoc-studio.vercel.app',
  verilens: 'https://verilens-snowy.vercel.app',
  'nova-ai-assistant': 'https://nova-ai-assistant-mocha.vercel.app',
  spectra: 'https://spectra-ten-olive.vercel.app',
  typeflow: 'https://typeflow-one.vercel.app',
  stillpoint: 'https://stillpoint-livid.vercel.app',
  staynest: 'https://staynest-two.vercel.app',
  algoviz: 'https://algoviz-lilac.vercel.app',
  cryptolab: 'https://cryptolab-six.vercel.app',
  githublens: 'https://githublens-kappa.vercel.app',
  coderunner: 'https://coderunner-snowy.vercel.app',
  cityhelp: 'https://cityhelp-sage.vercel.app',
};
const outDir = path.resolve('assets/raw-screenshots');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const results = {};
for (const [slug, url] of Object.entries(targets)) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  const page = await ctx.newPage();
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2500);
    const title = await page.title();
    await page.screenshot({ path: path.join(outDir, `${slug}.png`), type: 'png' });
    results[slug] = { url, status: res?.status(), title };
    console.log('ok', slug, res?.status(), title);
  } catch (e) {
    results[slug] = { url, error: String(e).slice(0, 120) };
    console.log('FAIL', slug, String(e).slice(0, 120));
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'capture-log.json'), JSON.stringify(results, null, 2));
