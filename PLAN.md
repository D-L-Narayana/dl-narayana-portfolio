# PLAN — D.L. Narayana portfolio

## 0. Positioning

One sentence the whole site serves: **"Narayana builds data pipelines that hold and products that
ship."** Audience: hiring engineers and recruiters for data / AI / full-stack roles. Everything on the
page is real GitHub data or copy derived from his own READMEs.

## 1. Stack & structure

- **Next.js 15 App Router + TypeScript**, `output: 'export'`, `trailingSlash: true` → pure static
  `out/` with `route/index.html` for every page (works on any static host, deep links included).
- **Tailwind v4** for utilities; design tokens as CSS custom properties in `globals.css`.
- **motion v12 (`motion/react`)** — the only animation runtime. Lenis for smooth scroll, ticked from
  Motion's own frame loop (`frame.update`) so there is exactly one rAF loop on the page.
- Fonts self-hosted via `next/font/local` (variable woff2, `display: swap`, latin subsets).
- Data: `scripts/fetch-github.mjs` pulls public data at build time (token optional, never shipped)
  and writes `src/data/github.json` (committed snapshot so builds are reproducible/offline).
- Images: `scripts/capture-live.mjs` screenshots the real live demos; `scripts/optimize-images.mjs`
  emits AVIF + WebP at 480/800/1200 widths; `<Picture>` component renders `<picture>` with `srcset`,
  `sizes`, lazy loading below the fold, eager + `fetchpriority=high` for the LCP image.
- OG images pre-rendered by Playwright from an HTML template → `public/og/*.png`.
- `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, per-route `generateMetadata`.

```
src/
  app/            layout.tsx template.tsx page.tsx not-found.tsx sitemap.ts robots.ts
                  work/page.tsx work/[slug]/page.tsx about/page.tsx github/page.tsx contact/page.tsx
  components/     providers/ (Theme, Motion, SmoothScroll, Cursor, Transition)
                  ui/ (Wordmark, Magnetic, Reveal, Picture, Button, Eyebrow, SectionHeader)
                  home/ (Hero, PipelineCanvas, FeaturedWork, GithubLive, About, Stack, Timeline, Contact)
                  layout/ (Nav, Footer, ThemeToggle, ScrollProgress)
  data/           projects.ts (curated copy)  github.json (snapshot)  content.ts (bio, stack, timeline)
  lib/            github.ts (merge + derive)  format.ts  motion.ts (springs, variants)
scripts/          fetch-github.mjs capture-live.mjs optimize-images.mjs og-images.mjs qa/*
```

## 2. Art direction — "Signal & Ledger"

A well-instrumented system: quiet warm surfaces, an editorial serif voice, monospace records, and a
single amber *signal* colour — the Gold layer, the checkpoint lamp. Dark is the default (developer
audience); light ("paper") is fully designed, not inverted.

### Palette

| role | dark | light | why |
| --- | --- | --- | --- |
| bg | `#0C0B09` | `#F4F0E6` | warm near-black / warm paper — never pure black or white |
| surface | `#13120F` | `#FBF8F1` | cards |
| surface-2 | `#1B1915` | `#ECE6D9` | raised / code blocks |
| border | `#27241F` | `#DBD3C3` | hairlines |
| border-strong | `#3B3730` | `#C4BAA6` | focus containers, hover rings |
| text | `#EDE8DF` | `#1A1712` | 15.9:1 / 16.4:1 |
| text-muted | `#A7A093` | `#5C554A` | ≥ 7:1 on bg |
| text-faint | `#7F786D` | `#7A7264` | ≥ 4.6:1 on bg — captions only |
| accent (signal) | `#F2B84B` | `#9A5300` | amber; 11.3:1 dark, 5.4:1 light |
| accent-strong | `#FFCB6B` | `#7D4300` | hover |
| on-accent | `#1A1400` | `#FFF7E8` | text on filled amber |

Language-breakdown bars use amber lightness steps (sequential), not a rainbow.

### Type

- **Display — Zodiak (Fontshare / ITF)**, variable 100–900 + italic. Hero at
  `clamp(2.75rem, 1.4rem + 5.6vw, 7.25rem)`, weight 500, line-height 0.95, tracking −0.02em.
  Italic for the one emphasised word per headline. Section titles `clamp(2rem, 1.3rem + 2.6vw, 3.5rem)`.
- **Body/UI — Satoshi (Fontshare)**, variable 300–900 + italic. Body 16–18px / 1.6; UI 14px;
  headings-in-body 600.
- **Data — JetBrains Mono** variable, 12–13px uppercase tracking 0.08em for eyebrows, tabular
  numerals for stats.
- Four sizes per page beyond hero: xs 12–13, sm 14, base 16–18, lg 20–24. Max measure 68ch.

### Spacing & grid

4px base. Container `min(1280px, 100% - 2 * clamp(20px, 5vw, 72px))`. Section padding
`clamp(4.5rem, 10vw, 9rem)`. A 12-col grid on ≥1024, 6 on tablet, 4 on mobile; hairline rules
(`border`) expose the grid at section boundaries.

### Motion language

- Springs: default `{stiffness: 200, damping: 30}`; snappy `{300, 25}`; cursor `{520, 42, mass .6}`;
  magnetic `{160, 16}`. Durations: hover 180ms ease-out, page wipe 420ms `[0.76,0,0.24,1]`.
- Reveal-on-view: opacity 0→1 + y 20→0 (spring), once, stagger 55ms — only in `motion` where the
  element already owns its final layout box (no CLS).
- Scroll-linked (`useScroll`/`useTransform`): hero canvas + headline parallax & fade, project images
  drift ±6% inside overflow-hidden masks, stack marquee speed from `useVelocity`, scroll progress hairline.
- Route transitions: `TransitionLink` → amber curtain (`scaleY`, origin bottom) → `router.push` →
  `template.tsx` enter (opacity/y) → curtain lifts (origin top). `AnimatePresence` owns the curtain.
- Shared layout: `layoutId` pill under the active nav item and active work filter.
- Everything on `transform`/`opacity` (+ `clip-path` for one reveal). `will-change` set only while
  animating via Motion's own handling. `MotionConfig reducedMotion="user"` → instant states.

### The cursor

Two layers (dot 6px, ring 36px) in a fixed, pointer-events-none root. Physics: critically damped
spring integrated each frame inside `frame.update` — dot stiff, ring loose — written to MotionValues
(no React re-render). Magnetic: `[data-cursor="magnetic"]` targets pull the ring to their centre
(follows pointer at 12 %), morph to their box radius, and the target itself translates toward the
pointer by 25 % of the offset via `Magnetic`. States via `data-cursor` on ancestors:
`view` (ring 88px + "View"), `drag` ("Drag" + arrows), `external` (↗), `text` (thin 2×28 bar),
`hide`, and native cursor restored on `input/textarea/select/[contenteditable]`. Blend
`mix-blend-mode: difference` on the dot over imagery. Disabled entirely on `(pointer: coarse)`,
`(hover: none)` and `prefers-reduced-motion`.

### Imagery

Real screenshots of the real live products (captured with Playwright, 1440×900), the three original
JPGs, and an SVG `SystemDiagram` for the backend projects built from README stage lists. No stock, no
generated photography. Hero visual is a Canvas 2D pipeline stream (events → Bronze/Silver/Gold gates,
a fraction diverted to quarantine) driven by the shared frame loop, DPR capped at 1.5, paused when
off-screen, static frame under reduced motion.

## 3. Wireframes

### Home `/`
1. **Nav** (fixed, 64px): wordmark left; Work · About · GitHub · Contact centre (layoutId pill);
   theme toggle + "Email" right. Collapses to wordmark + toggle + menu button < 768.
2. **Hero** (min 92vh): eyebrow mono "Data engineer · Full-stack · AI product — Visakhapatnam, India";
   H1 "Pipelines that *hold.* Products that *ship.*"; 1-paragraph intro; two CTAs (View work / GitHub);
   right/behind: PipelineCanvas with mono captions "510,663 events → Gold in 29.5 s". Bottom hairline
   with three live stats (public repos, public commits, last push).
3. **Selected work**: section header (numbered eyebrow 01 / title / "All work →"); 6 featured
   projects as alternating editorial rows on desktop (image 7 cols / copy 5 cols, swap sides), each:
   category eyebrow, name, one-line result, stack tags, repo + live links, whole card → detail.
4. **GitHub, live**: stat tiles (repos, commits, languages, streak of active weeks), language bars,
   26-week commit activity bars, "recently pushed" list with relative freshness.
5. **About**: two columns — portrait-free typographic block with the principle list; right: facts
   ledger (location, education, roles, currently exploring).
6. **Stack**: grouped rows Data / Web / AI / Fundamentals / Exploring as mono chips + a velocity marquee.
7. **Timeline**: vertical ledger, real dated entries derived from repo dates.
8. **Contact**: big serif line, email button, LinkedIn/GitHub; form (name/email/message) that opens a
   prefilled mailto and confirms.
9. **Footer**: wordmark, sitemap links, "Built with Next.js + Motion · data from the GitHub API on {date}".

### Work index `/work/`
Header + filter pills (All / Data / AI / Web / Tools, layoutId) → grid of all 17 projects (2–3 cols),
each card image + name + line + freshness. Cards animate with `layout`.

### Work detail `/work/[slug]/`
Hero: category eyebrow, H1 name, tagline, meta ledger (stack, language, last push, stars, links).
Full-bleed image or SystemDiagram. Sections: Problem · Approach · Results (metrics grid) · Stack.
Prev/next project footer.

### About `/about/` — long-form story (from README), principles, education, exploring, contact CTA.
### GitHub `/github/` — the live section expanded: full repo table sortable by pushed date.
### Contact `/contact/` — the contact block as a page.
### 404 — mono "404 — route not found", serif line, links home.

## 4. QA / iteration schedule

Round loop (minimum 6): build → `qa:shots` (1440/1024/768/375, both themes, key states) → `qa:fps`
(rAF timing + CDP trace during scripted scroll & hover) → `qa:lighthouse` → written critique in
`QA.md` → fixes → next round. Gates: no overflow/clipping at any width, AA contrast, no console
errors, no 404 assets, FPS avg ≥ 58 & 1 % low ≥ 45 desktop, Lighthouse P ≥ 90 / A ≥ 95 / BP ≥ 95 /
SEO ≥ 95, forbidden-API grep clean (`localStorage|sessionStorage|indexedDB|requestPointerLock|requestFullscreen`).
