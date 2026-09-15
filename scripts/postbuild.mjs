// Static-export post-processing.
// 1. Open Graph images get a real .png extension (S3-style hosts serve extension-less files without
//    a content type) and every reference is rewritten.
// 2. The export is made host-path independent: root-absolute references in HTML (/_next/, /images/,
//    icons, internal links) become depth-relative, the CSS font URLs become relative to the CSS file,
//    and the webpack public path is derived at runtime from the runtime chunk's own <script src>. The
//    site therefore renders correctly at the origin root AND under any sub-path (preview proxies,
//    file://, GitHub Pages project sites). Client-side routing keeps absolute route paths; on a
//    sub-path host TransitionLink falls back to relative full-page navigations (see Transition.tsx).
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
let files = walk(out);
let renamed = 0, rewritten = 0, relativised = 0;

for (const f of files) {
  if (path.basename(f) === 'opengraph-image') {
    fs.renameSync(f, `${f}.png`);
    renamed++;
  }
}
files = walk(out);
for (const f of files) {
  if (!/\.(html|txt|xml)$/.test(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  const s2 = s.replace(/\/opengraph-image\?[a-f0-9]+/g, '/opengraph-image.png').replace(/\/opengraph-image(?=["'\\\s<])/g, '/opengraph-image.png');
  if (s2 !== s) {
    fs.writeFileSync(f, s2);
    rewritten++;
  }
}

// ---- 2. path independence -------------------------------------------------------------------
const ROOT_FILES = ['favicon.svg', 'favicon-32.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'manifest.webmanifest', 'feed.xml', 'sitemap.xml', 'robots.txt', 'D-L-Narayana-Resume.pdf'];
const ROUTE_DIRS = fs
  .readdirSync(out, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith('_') && e.name !== 'images')
  .map((e) => e.name);

for (const f of files) {
  if (!f.endsWith('.html')) continue;
  const rel = path.relative(out, f);
  const depth = rel.split(path.sep).length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  // assets
  s = s.replace(/(["'(])\/_next\//g, `$1${prefix}_next/`);
  s = s.replace(/(["'(=,\s])\/images\/projects\//g, `$1${prefix}images/projects/`);
  for (const rf of ROOT_FILES) s = s.replace(new RegExp(`(href|src)="/${rf.replace(/\./g, '\\.')}"`, 'g'), `$1="${prefix}${rf}"`);
  // internal links in real attributes (not in the RSC flight data, which the router needs absolute)
  s = s.replace(/href="\/"/g, `href="${prefix}"`);
  for (const d of ROUTE_DIRS) s = s.replace(new RegExp(`href="/${d}/`, 'g'), `href="${prefix}${d}/`);
  if (s !== before) {
    fs.writeFileSync(f, s);
    relativised++;
  }
}
// CSS: fonts live next to the stylesheet (../media/ from static/css/)
for (const f of files) {
  if (!f.endsWith('.css')) continue;
  const s = fs.readFileSync(f, 'utf8');
  const s2 = s.replace(/url\(\/_next\/static\/media\//g, 'url(../media/');
  if (s2 !== s) fs.writeFileSync(f, s2);
}
// webpack public path from the runtime chunk's own script src
let patched = 0;
for (const f of files) {
  if (!/webpack-[a-f0-9]+\.js$/.test(f)) continue;
  const s = fs.readFileSync(f, 'utf8');
  const s2 = s.replace(
    /\.p="\/_next\/"/,
    `.p=(function(){try{var s=document.currentScript||Array.prototype.find.call(document.scripts,function(x){return/_next\\/static\\/chunks\\/webpack-/.test(x.src)});var i=s&&s.src.indexOf("/_next/");return i>0?s.src.slice(0,i+7):"/_next/"}catch(e){return"/_next/"}})()`,
  );
  if (s2 !== s) {
    fs.writeFileSync(f, s2);
    patched++;
  }
}
console.log(`postbuild: renamed ${renamed} OG images, rewrote ${rewritten} files, relativised ${relativised} HTML files, patched ${patched} webpack runtime`);
