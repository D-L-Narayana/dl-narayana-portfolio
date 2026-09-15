import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const OG_SIZE = { width: 1200, height: 630 };

const fontDir = path.join(process.cwd(), 'src/fonts/og');

async function fonts() {
  const [zodiak, zodiakItalic, satoshi] = await Promise.all([
    readFile(path.join(fontDir, 'Zodiak-Regular.ttf')),
    readFile(path.join(fontDir, 'Zodiak-Italic.ttf')),
    readFile(path.join(fontDir, 'Satoshi-Medium.ttf')),
  ]);
  return [
    { name: 'Zodiak', data: zodiak, weight: 400 as const, style: 'normal' as const },
    { name: 'Zodiak', data: zodiakItalic, weight: 400 as const, style: 'italic' as const },
    { name: 'Satoshi', data: satoshi, weight: 500 as const, style: 'normal' as const },
  ];
}

type Props = { eyebrow: string; title: string; emphasis?: string; subtitle?: string; footer?: string };

/** Shared 1200×630 social card: dark ink, amber signal, serif headline with one italic emphasis. */
export async function renderOg({ eyebrow, title, emphasis, subtitle, footer = 'dln-portfolio.vercel.app · github.com/D-L-Narayana' }: Props) {
  const size = title.length > 26 ? 76 : title.length > 16 ? 96 : 120;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#0c0b09', color: '#ede8df', fontFamily: 'Satoshi' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <svg width="60" height="40" viewBox="0 0 48 32" fill="none">
              <path d="M3 4v24M3 4h7a12 12 0 0 1 0 24H3" stroke="#ede8df" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 4v24h9" stroke="#ede8df" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M36 28V4l9 24V6" stroke="#ede8df" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="45" cy="4" r="2.6" fill="#f2b84b" />
            </svg>
            <span style={{ fontFamily: 'Zodiak', fontSize: 30 }}>D L Narayana</span>
          </div>
          <span style={{ fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', color: '#a7a093' }}>{eyebrow}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', fontFamily: 'Zodiak', fontSize: size, lineHeight: 1, letterSpacing: -2 }}>
            <span>{title}</span>
            {emphasis && (
              <span style={{ fontStyle: 'italic', color: '#f2b84b', marginLeft: 22 }}>{emphasis}</span>
            )}
          </div>
          {subtitle && <div style={{ fontSize: 30, lineHeight: 1.35, color: '#a7a093', maxWidth: 980 }}>{subtitle}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #27241f', paddingTop: 26, fontSize: 20, color: '#837c70' }}>
          <span>{footer}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#f2b84b' }} />
            <span>Pipelines that hold. Products that ship.</span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
