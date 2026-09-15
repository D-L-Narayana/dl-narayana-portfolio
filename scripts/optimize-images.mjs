// Emits AVIF + WebP renditions (480/800/1200 wide, 16:10, top-anchored cover) for every raw
// screenshot in assets/raw-screenshots → public/images/projects/<slug>-<w>.<ext>
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const rawDir = path.resolve('assets/raw-screenshots');
const outDir = path.resolve('public/images/projects');
const widths = [480, 800, 1200];
const files = fs.readdirSync(rawDir).filter((f) => /\.(png|jpe?g)$/i.test(f));
for (const f of files) {
  const slug = f.replace(/\.(png|jpe?g)$/i, '');
  const input = sharp(path.join(rawDir, f));
  const meta = await input.metadata();
  for (const w of widths) {
    const h = Math.round((w * 10) / 16);
    const base = input.clone().resize(w, h, { fit: 'cover', position: 'top' });
    await base.clone().webp({ quality: 80 }).toFile(path.join(outDir, `${slug}-${w}.webp`));
    await base.clone().avif({ quality: 55 }).toFile(path.join(outDir, `${slug}-${w}.avif`));
  }
  console.log(slug, `${meta.width}x${meta.height}`);
}
