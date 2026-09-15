// Minimal static server for QA: directory indexes, 404 page, gzip for text assets (what any real
// host does), long cache for hashed assets. Usage: node scripts/qa/serve.mjs <root> [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
const root = process.argv[2];
const port = Number(process.argv[3] || 3210);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.json': 'application/json', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf', '.jpg': 'image/jpeg' };
const compressible = new Set(['.html', '.js', '.css', '.svg', '.json', '.xml', '.txt', '.webmanifest']);
http
  .createServer((req, res) => {
    try {
      const u = decodeURIComponent(req.url.split('?')[0]);
      let p = path.join(root, u);
      if (!p.startsWith(root)) { res.writeHead(403); res.end(); return; }
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
      if (!fs.existsSync(p) && fs.existsSync(p + '.html')) p = p + '.html';
      let status = 200;
      if (!fs.existsSync(p)) { status = 404; p = path.join(root, '404.html'); if (!fs.existsSync(p)) { res.writeHead(404); res.end('404'); return; } }
      const ext = path.extname(p);
      const headers = { 'content-type': types[ext] || 'application/octet-stream', 'cache-control': u.startsWith('/_next/static/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate' };
      let body = fs.readFileSync(p);
      if (compressible.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { body = zlib.gzipSync(body, { level: 6 }); headers['content-encoding'] = 'gzip'; headers.vary = 'Accept-Encoding'; }
      res.writeHead(status, headers);
      res.end(body);
    } catch { res.writeHead(500); res.end('error'); }
  })
  .listen(port, '127.0.0.1', () => console.log('serving', root, 'on', port));
