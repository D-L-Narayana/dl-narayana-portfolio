// Lighthouse (mobile + desktop) against the local static server. Writes qa/lighthouse-*.json and
// prints category scores. Usage: node scripts/qa/lighthouse.mjs [base] [routes,comma]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const [, , base = 'http://127.0.0.1:3210', routesArg = '/,/work/,/work/lakeflow-cdc-pipeline/'] = process.argv;
const chrome = process.env.CHROME_PATH || path.join(os.homedir(), '.cache/ms-playwright/chromium-1217/chrome-linux64/chrome');
fs.mkdirSync('qa', { recursive: true });
const lh = path.resolve('node_modules/lighthouse/cli/index.js');
const results = [];
for (const route of routesArg.split(',')) {
  for (const preset of ['mobile', 'desktop']) {
    const name = `${route === '/' ? 'home' : route.replace(/\W+/g, '')}-${preset}`;
    const out = path.resolve('qa', `lighthouse-${name}.json`);
    const args = [lh, base + route, '--output=json', `--output-path=${out}`, '--quiet', '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage', '--only-categories=performance,accessibility,best-practices,seo'];
    if (preset === 'desktop') args.push('--preset=desktop');
    execFileSync('node', args, { env: { ...process.env, CHROME_PATH: chrome }, stdio: ['ignore', 'ignore', 'inherit'] });
    const j = JSON.parse(fs.readFileSync(out, 'utf8'));
    const c = j.categories;
    const audits = j.audits;
    const row = {
      route, preset,
      performance: Math.round(c.performance.score * 100), accessibility: Math.round(c.accessibility.score * 100), bestPractices: Math.round(c['best-practices'].score * 100), seo: Math.round(c.seo.score * 100),
      lcp: audits['largest-contentful-paint']?.displayValue, cls: audits['cumulative-layout-shift']?.displayValue, tbt: audits['total-blocking-time']?.displayValue, fcp: audits['first-contentful-paint']?.displayValue,
      failing: Object.values(audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === 'binary').map((a) => a.id).slice(0, 12),
    };
    results.push(row);
    console.log(`${name}: P ${row.performance} · A ${row.accessibility} · BP ${row.bestPractices} · SEO ${row.seo} · LCP ${row.lcp} · CLS ${row.cls} · TBT ${row.tbt} · failing: ${row.failing.join(', ') || 'none'}`);
  }
}
fs.writeFileSync('qa/lighthouse-summary.json', JSON.stringify(results, null, 2));
