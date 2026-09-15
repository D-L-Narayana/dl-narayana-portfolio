# QA log — D L Narayana portfolio

Tooling: `scripts/qa/screenshots.mjs` (full-page captures at 1440 / 1024 / 768 / 375, dark + light,
console errors, failed requests, horizontal-overflow detector), `scripts/qa/states.mjs` (cursor
states, magnetic snap, route curtain, mobile menu, focus ring, theme toggle, filters, reduced motion),
`scripts/qa/fps.mjs` (rAF frame timing + PerformanceObserver long tasks + CDP `Tracing` during a
wheel-scroll pass and a pointer sweep), `scripts/qa/lighthouse.mjs` (mobile + desktop).
Environment: headless Chromium 1217 (Playwright 1.59) on a 2-vCPU sandbox with **software rendering
and no vsync** — rAF runs unthrottled, so "avg fps" reads above 60; the meaningful numbers are the
frame-time percentiles (budget 16.7 ms) and dropped frames (> 25 ms). Real hardware with a GPU is
strictly faster than every number below.

Gates: no overflow / clipping at any width · AA contrast · no console errors · no 404 assets ·
p95 frame time ≤ 16.7 ms and 1 %-low ≥ 45 fps · Lighthouse P ≥ 90, A ≥ 95, BP ≥ 95, SEO ≥ 95 ·
forbidden-API grep clean.

---

## Round 1 — first build (2026-09-15 16:00)

Captures: 44 (8 routes × 4 widths, 3 routes also in light). Console errors: 0 (the /nope/ route
reports its own intentional 404). Overflow: 1 (`li.chip` 21 px past the viewport on /work/staynest/
at 768).

Critique (harsh):
- **Spacing is far too tight everywhere** — section headers sit 12 px under their hairline, GitHub
  stat tiles are clipped to 86 px tall with the label touching the left edge, `mt-16` gaps are
  missing. Root cause: my unlayered base/reset CSS (`* { margin:0; padding:0 }`, `h1…h4 {}`) sits
  outside Tailwind v4's `@layer` cascade and therefore beats *every* utility regardless of
  specificity. The whole page reads denser and cheaper than designed.
- Hero eyebrow's leading amber dot wraps onto its own line at 375.
- Section title "Six systems, shipped — pipelines, agents and products." breaks with an em dash
  leading line two. Too long for a display line.
- Commit chart: one 110-commit week flattens the other 25 bars into 2-px stubs — honest but
  unreadable.
- `.chip` uses `white-space: nowrap`, so "Supabase (Postgres + Auth)" overflows narrow columns.
- The OG images are emitted extension-less (`/opengraph-image`) — S3-style hosts would serve them
  without a content type.

Fixes: base styles moved into `@layer base`, component classes into `@layer components` (utilities
now win); title shortened to "Six systems, *shipped*."; chart on a labelled square-root scale; chips
wrap; `scripts/postbuild.mjs` renames OG files to `.png` and rewrites every reference; dot attached
to the roles text.

FPS (home, 1440×900): scroll p95 12.8 ms · p99 18.9 ms · 7 / 1923 frames > 25 ms · 0 long tasks;
hover p95 14.1 ms · p99 21.8 ms · 5 / 954 frames > 25 ms · 0 long tasks. Trace showed ~1 Layout per
frame during scroll → traced to the cursor writing SVG `rx/ry` every frame even when idle.
Lighthouse: not yet run.

## Round 2 — layered CSS (16:15)

Captures: 44. Console errors: 0. Overflow: 0. Pages grew (home 8 958 → 12 545 px at 1440) as the
intended whitespace appeared.

Critique:
- **Metric numerals are enormous and collide** ("1,009,98950.9 s"): my fluid `--text-2xl`
  (56 px) *replaced* Tailwind's `text-2xl` utility (24 px) because I declared it inside `@theme`.
  Same for `text-xl`/`text-lg`. Timeline headings at 56 px force "github.com/D-L-Narayana" to break
  mid-hyphen.
- The active filter pill on /work/ is **invisible**: `-z-10` behind a `relative` button that does
  not create a stacking context, and because `html` *and* `body` both had a background, the body
  background paints above negative-z children of the root. Light-on-paper text with no pill = an
  unreadable "All 17".
- Architecture SVG is illegible at 375 px (7 boxes, ~8 px labels) and inside 380-px work cards.
- Under `prefers-reduced-motion` the hero canvas still fades in over 1 s (opacity is not covered by
  Motion's reduced-motion handling), so the static frame appears late.
- Cursor: 1 Layout per frame from unconditional `rx/ry` attribute writes.

Fixes: fluid scale renamed to `--fs-*` and used only by `.display/.title/.lead/.eyebrow/.btn/.chip`
(Tailwind's `text-*` scale restored); `isolate` on pill hosts and `background` removed from `html`;
`SystemDiagram` now renders an HTML chip-flow below `md` and in compact cards, the SVG schematic
only where it has room; canvas fade is instant under reduced motion; cursor writes `rx/ry` only when
they change by > 0.05 and skips all DOM writes once its springs settle.

State captures verified: dot + ring follow; ring morphs to a rounded rectangle around magnetic
buttons and nav items; "View" label over project media; thin text bar over prose; amber curtain
covers/lifts on route change; nav pill slides; mobile menu opens with stagger; focus ring visible on
keyboard tab; theme toggle switches to paper; custom cursor NOT mounted on touch or reduced-motion
contexts; Lenis inactive under reduced motion; skip link off-screen until focused.

## Round 3 — proportion & hierarchy (16:35)

Captures: 44 + 13 state captures. Console errors: 0. Overflow: 0.

Critique:
- Layout finally breathes; metric numerals sit at 24–30 px, hero stats at 30–36 px. Rows read as
  editorial spreads. Mobile chip-flow diagrams are legible (13 px labels, Gold chip filled).
- Sub-pages `/about/`, `/github/`, `/contact/` had **no `<h1>`** (they reused the home section
  component whose title is an `<h2>`).
- Filter buttons used `role="tab"` without tab panels — semantically wrong.
- Definition lists put `<dd>` before `<dt>` (visual "big number, small label" order).
- **Lighthouse mobile home: P 55** — TBT 1 810 ms, LCP 4.8 s. Script evaluation 3.4 s on the 4×-throttled
  CPU; LCP element was the hero paragraph, whose `opacity: 0` inline style waited for Motion to hydrate
  (element render delay 1 660 ms). Desktop already P 99 / A 100 / BP 100 / SEO 100.
- Lighthouse a11y flagged contrast: filter count at 70 % opacity on amber (3.5:1), chip-flow caption
  `text-faint` on `surface-2` in light mode (4.2:1).
- FPS trace: 3 long tasks (max 294 ms) during scroll, 26/2600 frames > 25 ms — dozens of Motion
  `whileInView` elements (26 chart bars, list rows, chips) all mounting springs together.

Fixes:
- `SectionHeader` takes `titleAs`; full-page variants render `<h1>`. Filters → `aria-pressed`
  buttons in a `role="group"`. `<dt>`/`<dd>` order fixed with CSS `order`.
- Hero words, eyebrow, paragraph, CTAs, canvas and stats now animate with **CSS keyframes**
  (`.word-rise`, `.fade-rise`, transform/opacity, reduced-motion aware) so the LCP paints before any
  JavaScript. Motion still owns the hero's scroll-linked parallax and fade.
- A single `RevealObserver` (one IntersectionObserver) drives CSS reveals for dense lists — tiles,
  repo rows, stack rows, principles, timeline entries, result cards — replacing ~70 Motion elements.
  Motion `Reveal` remains on section headers, project rows and cards; `layoutId`, `AnimatePresence`,
  `useScroll`/`useTransform`, `useVelocity`, springs and stagger variants are untouched.
- Chart bars/segments: CSS `scaleY`/`scaleX` transitions with per-bar delay, flipped by one
  `useInView`. Canvas loop starts after `load` + idle; 80/150/220 particles by width.
- Fonts subset with pyftsubset (Latin + punctuation + arrows; variable axes kept): Zodiak 37→28 KB,
  Zodiak Italic 45→33 KB, Satoshi 43→30 KB; Satoshi Italic dropped (unused). `frame`/`cancelFrame`
  imported from `motion/react` so the vanilla `motion` entry is never bundled.
- Tokens: `--text-faint` → `#8a8377` (dark) / `#6b6355` (light): ≥ 4.67:1 on every surface.
  Filter count at full opacity; chip-flow captions `text-muted` at 12 px.

Measured after fixes (same build, home, 1440×900):
- **FPS — scroll:** p50 ≈ 3 ms · p95 5.5 ms · p99 9.9 ms · 2 / 3374 frames > 25 ms · 0 long tasks
  (Layout events 901 vs 2162 in round 1).
- **FPS — hover sweep:** p95 4.8 ms · p99 8.0 ms · 0 / 1314 dropped · 0 long tasks.
- **Lighthouse mobile:** home P 92 · A 100 · BP 100 · SEO 100 (LCP 3.3 s, TBT 100 ms, CLS 0);
  contact P 91. Earlier pass over every route (before the font diet): work 88, about 87, github 87,
  lakeflow 86, staynest 88 — all A ≥ 98, BP 100, SEO 100.
- **Lighthouse desktop:** home 100 / 100 / 100 / 100 (LCP 0.6 s); work 100; about 99; github 100;
  contact 100; lakeflow 99; staynest 99.

## Round 4 — accessibility & Lighthouse sweep (16:50)

Captures: 44 + 13 states. Console errors: 0. Overflow: 0. Lighthouse across 7 routes: desktop
99–100 everywhere; mobile 86–88 before, 91–92 after the font subset (LCP is Lantern's simulated
slow-4G font/CSS dependency; TBT 50–110 ms; CLS 0). a11y 98 on /about/ (heading order).

Critique:
- `/about/` jumped from `<h1>` straight to `<h3>` principle titles.
- In light mode the **Retail ETL schematic rendered as a dark grey slab**: the SVG `<pattern>` id
  was built from the project title and contained spaces ("grid-Retail Lakehouse ETL") → invalid
  `url()` → black fill at 70 %. Single-word titles masked the bug.
- "Raw JSON + CSV" overflowed its 140-px stage box.
- Marquee advertised a "Drag" cursor but is not draggable — a lie in the interaction language.
- "Recently pushed" descriptions were truncated by a crude regex; some cut mid-thought.
- ~290 px of dead space between sections (two 144-px paddings stacked).
- Skip link scrolled but did not move focus.

Fixes: heading levels follow the page (`h2/h3` on home, `h1/h2/h3` on `/about/`); pattern ids
slugified; stage label "Raw files" and 14-px labels for narrow boxes; marquee cursor state
removed; descriptions `line-clamp-2`; section padding `clamp(3.5rem, 7vw, 6.5rem)`; skip link
focuses `#main` after the Lenis scroll.

## Round 5 — schematic fit (17:00)

Captures: 44 + 13 states. Console errors: 0. Overflow: 0.

Critique:
- With the parallax wrapper (112 % tall) the schematic letterboxed inside its 16:10 mask; forcing
  `preserveAspectRatio="slice"` then **cropped the first and last stage boxes** off the sides.
  Screenshots need parallax; diagrams need to be read whole.
- Everything else holds at 1440 / 1024 / 768 / 375 in both themes: rows alternate cleanly, chip
  flows are legible, tiles/charts/lists reveal in sequence, the timeline rail draws with scroll.

Fixes: diagrams render at 100 % inside the mask with a 1.02 hover scale (no parallax, `meet`
fit); screenshots keep the ±6 % drift.

---

## Round 6 — v3 first build (2026-09-15 23:30)

Captures: home 1440 dark/light + scroll positions, 375 full, work 1440 light, lakeflow 1440 dark.
Console errors: 0. Overflow: 0.

Critique:
- **Covered stack cards bled through** — dimming a card with `opacity` made it translucent, so
  "Retail Lakehouse ETL" rendered over "LakeFlow". Fix: cards stay opaque; a bg-coloured veil
  (`.stack-veil`) fades in over the covered card instead.
- **Schematics letterboxed** in the tall media column of the stacked cards (a 16:10 drawing inside a
  ~1:1 box). Fix: `variant="vertical"` — stages descend a central rail, branch peels right, events
  fall; `preserveAspectRatio="slice"` is safe because nothing lives at the sides.
- **Case-study hero media never appeared**: `[data-reveal="clip"]` put `clip-path: inset(0 0 100%)`
  on the observed element, and a fully clipped target never intersects, so `data-in` was never set.
  Fix: clip the children, observe the parent.
- **No side margins on mobile.** `.container` collided with Tailwind v4's own `container` utility
  (`width: 100%`), which beat the component-layer rule — the v2 layout only looked right on desktop
  because Tailwind's `max-width` happened to match. Renamed to `.shell`.
- Skill matrix cells were 63 px squares (table `width: 100%`) → a 1,000 px tall table. Fix: cells
  `clamp(26px, 2.6vw, 40px)`, table `width: auto`, explanatory aside in the remaining columns.

## Round 7 — tablet, ultrawide, 320 (2026-09-15 23:50)

Captures: 1920 dark, 2560 light, 1024 dark, 768 light, 320 light, about/github/contact/notes.
- At 768 the 5/7 card split squeezed "29.5 s" onto two lines and cropped the quarantine box.
  Fix: sticky stacking and the two-column card start at `lg`; below that cards flow single-column.
  At 1024 the copy column is 6/12 (5/12 from `xl`).
- Wordmark wrapped at 320 → name hidden below 360 px; hero stat numerals `text-2xl` on phones.
- Ultrawide: shell widens to 1520 px from 1920.
- Résumé PDF came out at 3 pages, then the body jumped to page 2: `body { min-height: 100dvh }` and
  the section padding pushed the (unbreakable) two-column body off page 1. Fix: print CSS zeroes
  both, flex body, compact type → exactly one A4 page with all six featured projects.

## Round 8 — end-to-end + Lighthouse (2026-09-16 00:20)

`scripts/qa/e2e.mjs`: 60 checks — every sitemap route (200, one `<h1>`, title, no console errors,
no failed requests), 404, RSS, manifest, PDF, intro lifecycle, hero canvas, palette open/search/
Enter-navigation/theme action/Escape, count-up exactness, chapter nav + hash, work filters +
`aria-pressed`, contact form confirmation, matrix hover cross-highlight + links, skip link and focus
ring, mobile menu, no cursor / no Lenis on touch, reduced-motion behaviour, forbidden-API grep of the
app chunks, placeholder grep of every HTML file. Two initial failures were test timing (exit
animations); waits raised to 0.8–0.9 s and Escape is now also handled globally.
`scripts/qa/links.mjs`: 2,295 internal references in 64 files, 0 missing.

Lighthouse (first pass, uncompressed QA server): home mobile P 70, LCP 6.4 s — the HTML document
was 353 KB uncompressed (RSC payload duplicates server-rendered SVG covers and the cards' props).
Fixes: gzip in the QA server (what every host does), lighter procedural covers (44 integer-rounded
lines, 2 arcs), trimmed client props for the stacked cards (283 KB HTML → ~45 KB over the wire).
Accessibility findings fixed: `<dl>` with a non-dt/dd child (scroll cue moved out), three
`label-content-name-mismatch` cases (aria-labels replaced with visible/sr-only content).

After fixes — mobile: home **P 91 · A 100 · BP 100 · SEO 100** (LCP 3.4 s, TBT 110 ms, CLS 0),
case study 89 (LCP 3.8 s), note 93; desktop: home 98, case study 100, note 100 (LCP 0.6 s).
Case-study and note headers now animate with CSS (`fade-rise`) instead of Motion so the LCP text
never waits for hydration.

## Round 9 — polish (2026-09-16 00:40)

- Palette matched "spark" against every tagline containing those letters in order — meta fields now
  need a substring match; labels keep the fuzzy subsequence scoring.
- Stack cards show the project summary on `xl` when the viewport is tall enough
  (`[@media(max-height:780px)]:hidden`).
- Notes aside: chapter list and "From the project" share one sticky container.
