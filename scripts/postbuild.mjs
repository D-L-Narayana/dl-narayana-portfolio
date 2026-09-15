// Static-export post-processing: give Open Graph images a real .png extension (S3-style hosts
// serve extension-less files without a content type) and rewrite every reference in the HTML.
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('out');
const walk = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, acc) : acc.push(p);
  }
  return acc;
};
const files = walk(out);
let renamed = 0, rewritten = 0;
for (const f of files) {
  if (path.basename(f) === 'opengraph-image') {
    fs.renameSync(f, `${f}.png`);
    renamed++;
  }
}
for (const f of files) {
  if (!/\.(html|txt|xml)$/.test(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  const s2 = s.replace(/\/opengraph-image\?[a-f0-9]+/g, '/opengraph-image.png').replace(/\/opengraph-image(?=["'\\\s<])/g, '/opengraph-image.png');
  if (s2 !== s) {
    fs.writeFileSync(f, s2);
    rewritten++;
  }
}
console.log(`postbuild: renamed ${renamed} OG images, rewrote ${rewritten} files`);
