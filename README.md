# D L Narayana — portfolio

Personal developer portfolio of **D L Narayana** (data engineer · full-stack · AI product,
Visakhapatnam). Built on **Next.js 15 (App Router, static export) + TypeScript + Tailwind v4 +
Motion + Lenis**, driven by real GitHub data. Design system: **"Signal & Ledger"** — warm ink /
paper surfaces, Zodiak serif voice, Satoshi body, JetBrains Mono records, one amber signal.

- `research.md` — the original repo, the GitHub data harvested, reference research.
- `PLAN.md` — stack, art direction, wireframes, the v3 upgrade plan.
- `QA.md` — every iteration round with critique, fixes, FPS and Lighthouse numbers.

## What's on the site

| Route | What it is |
| --- | --- |
| `/` | Full-bleed **WebGL event field** hero (raw WebGL1, analytic GPU particles, Canvas 2D fallback, static under reduced motion), CSS-driven **intro sequence**, sticky **stacked case-study cards**, GitHub-live section, about, **technology × project ledger** (skills matrix), notes teaser, timeline, contact |
| `/work/`, `/work/[slug]/` | Filterable index of all 17 public projects; case studies with a sticky chapter nav, count-up metrics, architecture schematics drawn from README stage lists, related notes and a next-project hand-off |
| `/notes/`, `/notes/[slug]/` | Five engineering notes distilled from the project READMEs, procedural SVG covers, RSS at `/feed.xml` |
| `/about/` | Story, "Now", principles, stack ledger, timeline |
| `/github/` | Full public-repository table, commit rhythm, language share |
| `/resume/` | Printable one-page résumé; `/D-L-Narayana-Resume.pdf` is printed from this page at build time |
| `/contact/` | Email / LinkedIn / GitHub + a form that composes a prefilled mail |

Everywhere: **⌘K / Ctrl+K command palette** (pages, projects, notes, actions — fuzzy search, full
keyboard control), custom cursor with magnetic snap, labelled route-transition curtain, ink/paper
theme (system preference + toggle, no storage), scroll-progress hairline, skip link, focus rings,
reduced-motion variants of every animation, per-route Open Graph images, JSON-LD (Person,
SoftwareSourceCode, TechArticle, BreadcrumbList), sitemap, robots, web manifest, RSS, and
analytics-ready hooks (`track()` fans out to `dataLayer` / Plausible / Umami / a DOM event —
nothing is loaded unless you wire it).

## Run

```bash
npm install
npm run data        # optional: refresh src/data/github.json from the public GitHub API (GITHUB_TOKEN optional)
npm run images      # optional: regenerate AVIF/WebP renditions from assets/raw-screenshots
npm run build       # static export → out/ (+ OG image post-processing)
npm run serve       # gzip static server for out/ on :3210
npm run resume      # print /resume/ to public/D-L-Narayana-Resume.pdf (needs the server on :3210)
```

QA (all need the static server on :3210):

```bash
npm run qa:e2e         # 60 Playwright checks: every route, palette, theme, filters, form, a11y, reduced motion, forbidden APIs, placeholders
npm run qa:links       # every internal href/src/srcset in out/ resolves
npm run qa:subpath     # the export mounted under a strict sub-path (needs: node scripts/qa/serve.mjs out 3211 /sub/site strict)
npm run qa:shots -- r1 # full-page captures at 1440/1024/768/375, both themes
npm run qa:fps         # frame-time percentiles during scripted scroll + hover
npm run qa:lighthouse  # mobile + desktop Lighthouse per route
```

## Configuration

- `src/data/content.ts` — identity, links, roles, education, motto, résumé path, "Now" list.
- `src/data/projects.ts` — curated case-study copy (problem / approach / results / stack / diagram).
- `src/data/notes.ts` — engineering notes (block-based, tiny inline syntax).
- `site.url` in `content.ts` is the canonical origin used for metadata, sitemap and RSS — change it
  when the domain changes.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — set at build time to inject Plausible; otherwise no analytics
  script ships. `track(name, props)` in `src/lib/analytics.ts` is the single hook.

## Hosting

`out/` is host-path independent: `scripts/postbuild.mjs` relativises asset and link paths, patches the
webpack public path, and the router falls back to relative full-page navigations when the site is
mounted under a prefix — so the same build works at an origin root (Vercel, Netlify, S3 + CDN), on a
GitHub Pages project path, behind a preview proxy, or from `file://`. `npm run qa:subpath` proves it.

## Constraints kept on purpose

No storage APIs (localStorage/sessionStorage/indexedDB), no pointer lock, no fullscreen, no runtime
CDN dependencies — fonts, libraries and images are self-hosted. Everything factual on the site comes
from the public GitHub API snapshot or the repositories' own READMEs; nothing is invented.
