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
