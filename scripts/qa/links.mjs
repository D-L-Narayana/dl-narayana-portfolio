// Static link checker: every internal href/src in out/**/*.html must resolve to a file in out/.
import fs from 'node:fs';
import path from 'node:path';
const out = path.resolve('out');
const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, acc) : acc.push(p); } return acc; };
const files = walk(out).filter((f) => /\.(html|xml|txt|webmanifest)$/.test(f));
const missing = new Set(); let checked = 0;
const resolves = (u) => {
  const clean = u.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return true;
  const p = path.join(out, decodeURIComponent(clean));
  return fs.existsSync(p) || fs.existsSync(path.join(p, 'index.html')) || fs.existsSync(p + '.html') || fs.existsSync(p + '/index.html');
};
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(/(?:href|src|content|<loc>)=?["']?(\/[^"'\s<>)\\]*)/g)) {
    const u = m[1];
    if (u.startsWith('//')) continue;
    checked++;
    if (!resolves(u)) missing.add(`${path.relative(out, f)} → ${u}`);
  }
  for (const m of s.matchAll(/https?:\/\/dln-portfolio\.vercel\.app(\/[^"'\s<>)\\]*)/g)) { checked++; if (!resolves(m[1])) missing.add(`${path.relative(out, f)} → ${m[1]}`); }
}
console.log(`links: checked ${checked} internal references in ${files.length} files, ${missing.size} missing`);
for (const m of missing) console.log(' -', m);
process.exit(missing.size ? 1 : 0);
