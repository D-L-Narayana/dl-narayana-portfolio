# D L Narayana — portfolio

Personal developer portfolio, rebuilt end-to-end on **Next.js 15 (App Router, static export) +
TypeScript + Tailwind v4 + Motion (framer-motion) + Lenis**, driven by real GitHub data.

- `research.md` — what the old repo was, the GitHub data harvested, the reference research.
- `PLAN.md` — stack, art direction ("Signal & Ledger"), wireframes, QA schedule.
- `QA.md` — every iteration round with critique, fixes, FPS and Lighthouse numbers.

## Run

```bash
npm install
npm run data      # optional: refresh src/data/github.json from the public GitHub API (GITHUB_TOKEN optional)
npm run images    # optional: regenerate AVIF/WebP renditions from assets/raw-screenshots
npm run build     # static export → out/ (+ OG image post-processing)
npm start         # serve out/ on :3000
```

QA: `npm run qa:shots -- r1`, `npm run qa:fps`, `npm run qa:lighthouse` (needs the static server on
:3210 — `npx serve out -l 3210`).

No storage APIs (localStorage/sessionStorage/indexedDB), no pointer lock, no fullscreen. Theme is
system-preference + in-memory toggle. Fonts (Zodiak, Satoshi, JetBrains Mono) are self-hosted.
