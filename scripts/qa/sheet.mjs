// Slices a full-page screenshot into viewport-height frames and tiles them into one JPEG sheet.
// Usage: node scripts/qa/sheet.mjs <png> <out.jpg> [frameH=900] [cols=3] [scale=0.5]
import sharp from 'sharp';
const [, , input, output, frameHArg = '900', colsArg = '3', scaleArg = '0.5'] = process.argv;
const frameH = Number(frameHArg), cols = Number(colsArg), scale = Number(scaleArg);
const img = sharp(input);
const { width, height } = await img.metadata();
const n = Math.ceil(height / frameH);
const fw = Math.round(width * scale), fh = Math.round(frameH * scale);
const rows = Math.ceil(n / cols);
const comps = [];
for (let i = 0; i < n; i++) {
  const top = i * frameH, h = Math.min(frameH, height - top);
  const buf = await sharp(input).extract({ left: 0, top, width, height: h }).resize(fw, Math.round(h * scale)).toBuffer();
  comps.push({ input: buf, left: (i % cols) * (fw + 6), top: Math.floor(i / cols) * (fh + 6) });
}
await sharp({ create: { width: cols * (fw + 6), height: rows * (fh + 6), channels: 3, background: '#444' } }).composite(comps).jpeg({ quality: 72 }).toFile(output);
console.log(output, `${n} frames`, `${cols * (fw + 6)}x${rows * (fh + 6)}`);
