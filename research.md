# Research — D.L. Narayana portfolio rebuild

Date: 2026-09-15. Raw API responses live in `.research/` (git-ignored: they were pulled with an
authenticated token and include metadata about private repositories that must never ship).

## 1. The existing repo (what was there, what we kept)

`D-L-Narayana/dl-narayana-portfolio` (private, default branch `master`, 27 commits).

- Stack: zero-build vanilla HTML/CSS/JS + vendored GSAP 3. Fonts vendored (Archivo Black, Caveat,
  Instrument); body copy fell back to Arial / Courier New.
- Concept: a "cinematic" single page — dithered loader, elastic name entrance, filmstrip carousel of
  three projects (CityHelp, StayNest, ResumeForge), scroll-to-expand overlay, GSAP-driven stages.
- Positioning: "web & product design enthusiast", UI/UX chips, "React basics". Three projects.
- Good: three real product screenshots (`assets/*.jpg`), verified copy for those three projects,
  real live URLs, the ambition for motion, the instinct to vendor everything.
- Weak: no routing or sub-pages, no SEO metadata, no light theme, no keyboard/a11y story
  (nav items are `<button>`s that scroll), system fonts for body, 12 hard-coded hex colours with no
  token system, animations on `top/left/width`, positioning that badly under-sells the GitHub reality.

### Decision: rebuild, carry the assets

Framer Motion is mandatory and needs React, so the GSAP/vanilla base cannot be evolved without
rewriting every interaction anyway. More importantly the content story is wrong: GitHub shows a data /
AI / full-stack engineer with 17 public repositories, quantified pipeline results and a coherent
engineering philosophy — the old site shows a "design enthusiast" with three cards. We rebuild on
Next.js (App Router, static export) and carry forward the three screenshots, the verified project
facts and live URLs, and the vendor-everything discipline.

## 2. Real data harvested (public GitHub API, 2026-09-15)

Profile (`/users/D-L-Narayana`): name "D L Narayana", location "INDIA", 18 public repos, 3 followers,
account created 2025-12-14. No bio/company/blog set on the profile itself.

Profile README (`D-L-Narayana/D-L-Narayana`, pushed 2026-09-04) — the canonical self-description:

- Visakhapatnam, India. B.Tech Computer Science & Engineering, GITAM, Class of 2027, CGPA 7.97/10.
- Role: "Data Engineer · Full-Stack Developer · AI Product Engineer".
- Data: Apache Spark (PySpark, Spark SQL, Structured Streaming), Kafka, Debezium CDC, Airflow,
  Parquet lakehouse (Bronze/Silver/Gold), star schema & SCD2, DQ gates, PostgreSQL, MongoDB, Docker,
  pytest, JSON structured logging.
- Stack: TypeScript, React, Next.js, Node.js, Python, Java, SQL, Prisma, PostgreSQL, Tailwind.
- AI: LLM integration, RAG, embeddings/vector search, agents, evals & guardrails.
- Exploring: Databricks & Delta Lake, Snowflake, Hadoop/Hive, Kafka Streams, Data Contracts.
- Principle: "idempotent pipelines, explicit schemas, tests for every transform, metrics for every run".
- Contact: nvr0910@gmail.com · linkedin.com/in/dlnarayana · github.com/D-L-Narayana.
- Sign-off: "Build things that matter. Ship things that work."

Public repositories (17 + profile README repo), all original (no forks):

| repo | lang | created | pushed | live |
| --- | --- | --- | --- | --- |
| aerosentry-agents | Python | 2026-09-03 | 2026-09-03 | — |
| retail-lakehouse-etl | Python | 2026-09-03 | 2026-09-03 | — |
| lakeflow-cdc-pipeline | Python | 2026-09-03 | 2026-09-03 | — |
| resumeforge | JavaScript | 2026-08-19 | 2026-08-23 | resumeforge-ruby-rho.vercel.app |
| docuforge | JavaScript | 2026-07-26 | 2026-07-27 | docuforge-brown.vercel.app |
| verilens | Python | 2026-07-26 | 2026-07-27 | verilens-snowy.vercel.app (from README) |
| veridoc-studio | Python | 2026-07-26 | 2026-07-27 | veridoc-studio.vercel.app |
| nova-ai-assistant | TypeScript | 2026-06-24 | 2026-06-24 | nova-ai-assistant-mocha.vercel.app |
| spectra | TypeScript | 2026-06-07 | 2026-06-07 | spectra-ten-olive.vercel.app |
| typeflow | TypeScript | 2026-06-07 | 2026-06-07 | typeflow-one.vercel.app |
| stillpoint | TypeScript | 2026-06-06 | 2026-06-07 | stillpoint-livid.vercel.app |
| staynest | TypeScript | 2026-06-03 | 2026-06-06 | staynest-two.vercel.app |
| algoviz | JavaScript | 2026-06-03 | 2026-06-06 | algoviz-lilac.vercel.app |
| cryptolab | JavaScript | 2026-06-03 | 2026-06-05 | cryptolab-six.vercel.app |
| githublens | TypeScript | 2026-06-03 | 2026-06-05 | githublens-kappa.vercel.app |
| coderunner | TypeScript | 2026-06-03 | 2026-06-05 | coderunner-snowy.vercel.app |
| cityhelp | TypeScript | 2026-06-03 | 2026-06-05 | cityhelp-sage.vercel.app |

Language bytes across public repos: TypeScript 54.4%, JavaScript 18.4%, Python 16.4%, CSS 6.3%,
HTML 4.5%, Makefile/Dockerfile < 0.2%.

Quantified results copied from the repos' own READMEs (used verbatim, never rounded up):

- LakeFlow: 510,663 CDC events → Gold in 29.5 s (~17.3K events/s, 2 vCPU); 5,239 rows quarantined;
  7 pytest tests; exactly-once checkpointed sinks.
- Retail Lakehouse ETL: 1,009,989 rows in 50.9 s (~19.8K rows/s); 981 corrupt lines captured;
  9,993 duplicates removed; 1.30 % quarantined; 5 tests.
- AeroSentry: LangGraph supervisor + 3 specialists, hybrid RAG (BM25 + dense, RRF), HITL approval
  gate, 17 offline tests, golden-set evals, FastAPI + Docker + CI.
- VeriLens: INT8 quantisation cut model payload 16.6 MB → 5.6 MB (−66 %); genuine cosine 0.85 vs
  impostor −0.01; liveness p = 0.998 live vs 0.06 replay; Playwright E2E.
- Nova, StayNest, CityHelp, GitHubLens, CodeRunner, AlgoViz, CryptoLab, Spectra, Typeflow,
  Stillpoint, DocuForge, VeriDoc Studio, ResumeForge: descriptions and stacks from repo metadata.

Activity: 321 commits on public repos between 2026-04-05 and 2026-09-04 (114 of them by
`github-actions[bot]` on the profile README, excluded from the activity chart). No pinned repos are
set, so the site uses an explicitly-labelled "Featured" selection instead of pretending to be pinned.
GitHub's overall contribution calendar is dominated by private repositories and is deliberately
NOT displayed — only public, verifiable activity is shown.

Unknowns we omit rather than invent: employer/internships, availability, testimonials, photos.

## 3. Reference research — patterns worth stealing

Sources: Plenox Studio "Best Portfolio Websites 2026", School of Motion "10 websites with great
animation in 2026", Layero "Creative portfolio website design 2026", The Crit "Best font pairings
for designer portfolios 2026", A1 Gallery typographic portfolios, websitereviewai "Portfolio trends
2026", Olivier Larose "Sticky cursor" tutorial, Awwwards developer/portfolio categories.

Patterns adopted:

1. **Lead with the work, contextualise it.** Case studies as problem → approach → result with the
   contributor's exact role; link code AND live demos; ~6 strong pieces on the home page, the rest on
   a dedicated index. (Plenox, Layero)
2. **Type-first hierarchy.** One display face carrying the voice, one invisible body face, one mono
   for data; 3–4 sizes; exposed grid lines and monospace micro-labels read as "structured,
   technical". (A1 Gallery, websitereviewai, The Crit's "stop defaulting to Inter")
3. **Restrained palette that leaves room for the work**; colour only as signal. (Layero)
4. **Motion that is noticed in retrospect**: staggered card entrances as hierarchy cues, choreographed
   case-study reveals, seamless section transitions, thumbnails that respond to hover with subtle
   scale. Avoid scroll-jacking and animation for its own sake. (School of Motion — Epic, Eszter Bial,
   Uncommon; Layero)
5. **Cursor as an instrument, not a toy**: dot + ring, spring-smoothed (`useSpring` damping 20,
   stiffness 300, mass 0.5 as a baseline), magnetic snap to the element centre with ~10 % pointer
   follow, contextual labels. (Larose)
6. **A hero that demonstrates the actual subject** — Bruno Simon's site *is* Three.js because that is
   what he teaches. Our hero is a live CDC pipeline stream because that is what he builds. (Plenox)
7. **Performance is part of the portfolio**: loads instantly, works on a slow phone, scores well on
   accessibility — and is measured. (Plenox, Layero: Lighthouse 90+)
8. **Be explicit about who/what/contact** in the first viewport; state the kind of work wanted.

Anti-patterns explicitly avoided: thumbnail grids without reasoning, WebGL unrelated to the work,
heavy cursors that hide the content, Inter/Tailwind-defaults look, purple gradient blobs, too many
projects with thin documentation, stale dates, badge-collection stacks, fake testimonials/logos.
