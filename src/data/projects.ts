export type Category = 'data' | 'ai' | 'web' | 'tools';

export const CATEGORY_LABEL: Record<Category, string> = {
  data: 'Data engineering',
  ai: 'AI & computer vision',
  web: 'Full-stack product',
  tools: 'Frontend & tooling',
};

export type Metric = { value: string; label: string };

export type Diagram = { stages: string[]; branch?: { from: number; label: string }; orchestrator?: string };

export type ProjectContent = {
  slug: string;
  title: string;
  category: Category;
  tagline: string;
  summary: string;
  problem: string;
  approach: string[];
  results: Metric[];
  stack: string[];
  liveOverride?: string;
  featured?: number;
  hasScreenshot: boolean;
  diagram?: Diagram;
  accent?: string;
};

export const projects: ProjectContent[] = [
  {
    slug: 'lakeflow-cdc-pipeline',
    title: 'LakeFlow',
    category: 'data',
    tagline: 'Real-time CDC lakehouse: Postgres → Debezium → Kafka → Spark → Bronze/Silver/Gold.',
    summary:
      'Streams every insert, update and delete out of PostgreSQL through Debezium and Kafka into Spark Structured Streaming, landing a medallion Parquet lakehouse with SCD Type 2 history and a data-quality quarantine.',
    problem:
      'Operational databases change thousands of times a second, but analytics usually sees a nightly snapshot. Deletes vanish, history is lost, and replaying a failed run duplicates rows. The goal was a pipeline where the warehouse is a faithful, replayable, historised mirror of the OLTP system — in seconds, not hours.',
    approach: [
      'Postgres runs with logical WAL and REPLICA IDENTITY FULL so Debezium emits before/after images; Kafka (KRaft) carries one topic per table.',
      'Spark Structured Streaming appends the raw envelope to an immutable, checkpointed Bronze layer partitioned by table and ingest date — exactly-once at the sink.',
      'foreachBatch upserts derive Silver with latest-per-key on the WAL commit order (ts_ms, lsn), honour deletes, and version customers as SCD Type 2. Rows failing declarative rules land in a quarantine table with the rule names.',
      'Gold marts (daily revenue, product ranks, customer LTV) are Spark SQL; one set of transforms powers both the stream and the nightly Airflow backfill, so a single pytest suite covers both paths.',
    ],
    results: [
      { value: '510,663', label: 'CDC events replayed' },
      { value: '29.5 s', label: 'end-to-end to Gold (2 vCPU)' },
      { value: '~17.3K/s', label: 'events per second' },
      { value: '5,239', label: 'rows quarantined with reasons' },
    ],
    stack: ['PySpark', 'Structured Streaming', 'Kafka', 'Debezium', 'PostgreSQL', 'Parquet', 'Airflow', 'Docker Compose', 'pytest'],
    featured: 1,
    hasScreenshot: false,
    diagram: {
      stages: ['Postgres', 'Debezium', 'Kafka', 'Spark', 'Bronze', 'Silver', 'Gold'],
      branch: { from: 5, label: 'Quarantine' },
      orchestrator: 'Airflow · nightly backfill',
    },
  },
  {
    slug: 'retail-lakehouse-etl',
    title: 'Retail Lakehouse ETL',
    category: 'data',
    tagline: 'Schema-enforced PySpark batch warehouse over a million defective sales lines.',
    summary:
      'A production-shaped batch ETL: 1M+ semi-structured retail sales lines through explicit schemas, harmonisation, window-function dedupe, an 8-rule quality gate and into a star schema with an SCD2 customer dimension and Spark SQL marts.',
    problem:
      'Raw retail feeds arrive as month-partitioned JSON with malformed lines, duplicate sale IDs, null foreign keys and two timestamp formats. A warehouse built on them silently mis-attributes revenue unless bad data is caught, quarantined and reported — and reruns must be byte-identical so retries are safe.',
    approach: [
      'Every source is read with an explicit StructType in PERMISSIVE mode; corrupt JSON is captured in _corrupt_record and schema drift is detected on a sample and logged before it becomes nulls.',
      'Harmonisation normalises casing and timestamps; row_number() with a total ordering removes duplicates deterministically.',
      'Eight declarative data-quality rules produce a per-rule breakdown and a quarantine table; the run fails only if the quarantine share crosses a threshold.',
      'Dimensions use SCD Type 2 validity windows and the fact table joins on the version valid at order time; the fact is Hive-partitioned by year/month so Hive, Athena, Synapse or Databricks can query it in place. Marts use LAG, DENSE_RANK and cumulative windows; MongoDB serving loads are idempotent upserts.',
    ],
    results: [
      { value: '1,009,989', label: 'raw sales lines read' },
      { value: '50.9 s', label: 'end-to-end (~19.8K rows/s)' },
      { value: '9,993', label: 'duplicates removed' },
      { value: '1.30 %', label: 'quarantined, per-rule breakdown' },
    ],
    stack: ['PySpark', 'Spark SQL', 'Parquet', 'MongoDB', 'Airflow', 'pytest', 'Python 3.12'],
    featured: 2,
    hasScreenshot: false,
    diagram: {
      stages: ['Raw JSON + CSV', 'Extract', 'Harmonise', 'DQ gate', 'Star schema', 'Marts', 'MongoDB'],
      branch: { from: 3, label: 'Quarantine' },
      orchestrator: 'Airflow DAG · JSON run metrics',
    },
  },
  {
    slug: 'aerosentry-agents',
    title: 'AeroSentry',
    category: 'ai',
    tagline: 'Multi-agent AI operations layer for autonomous drone fleets, with a human in the loop.',
    summary:
      'A LangGraph supervisor routes operator requests to planner, analyst and knowledge agents that gather evidence with validated tools, ground themselves through hybrid RAG, analyse thermal frames — and hand every high-risk action to a human approval gate.',
    problem:
      'Agentic systems that only suggest are safe but useless; agents that act are useful but dangerous. Drone operations need an AI that can schedule, inspect and alert on its own, yet can never launch, abort or escalate without deterministic policy checks and an operator’s explicit approval.',
    approach: [
      'A LangGraph supervisor loads persistent SQLite memory and routes to specialists; agents run a ReAct tool loop over Pydantic-validated Python functions (telemetry, weather, geofence, schedule, abort).',
      'The knowledge agent answers from operator manuals and incident logs via hybrid retrieval — BM25 plus dense embeddings fused with Reciprocal Rank Fusion — with citations.',
      'The analyst reads aerial thermal frames with a vision-language model and falls back to a deterministic numpy hotspot detector; alert severity must be backed by imagery evidence.',
      'A safety gate applies hard policy checks (battery floor, wind limit, geofence, altitude ceiling) and interrupts the graph before high-risk actions until a human approves via API, console or CLI. Every LLM call, tool call, routing decision and verdict is traced to JSONL; a golden-set eval harness scores routing, tool accuracy, HITL gating and latency in CI.',
    ],
    results: [
      { value: '3 + 1', label: 'specialist agents + supervisor' },
      { value: '17', label: 'offline tests in CI' },
      { value: 'HITL', label: 'approval gate on every high-risk action' },
      { value: 'p50 / p95', label: 'latency tracked in golden-set evals' },
    ],
    stack: ['Python', 'LangGraph', 'Pydantic', 'FastAPI', 'Hybrid RAG (BM25 + dense, RRF)', 'SQLite', 'Docker', 'GitHub Actions'],
    featured: 3,
    hasScreenshot: false,
    diagram: {
      stages: ['Operator', 'Supervisor', 'Specialists', 'Safety gate', 'Human approval', 'Execute'],
      branch: { from: 3, label: 'Blocked by policy' },
      orchestrator: 'JSONL traces · LangSmith optional',
    },
  },
  {
    slug: 'verilens',
    title: 'VeriLens',
    category: 'ai',
    tagline: 'On-device KYC: face match, passive liveness, OCR and tamper forensics — 100 % in the browser.',
    summary:
      'A complete identity-verification suite that runs on ONNX Runtime Web and Tesseract WASM with zero inference APIs: the images never leave the device, and INT8 quantisation cut the model payload by two thirds.',
    problem:
      'KYC normally means uploading a passport and a selfie to someone else’s server. The challenge was to run detection, embedding, liveness, OCR and forgery analysis client-side on low-bandwidth devices without losing the decision margins that make the verdict trustworthy.',
    approach: [
      'UltraFace RFB-320 finds faces, MobileFaceNet produces embeddings compared by cosine similarity; MiniFASNetV2 with 3-crop test-time augmentation scores passive liveness.',
      'Tesseract 5 LSTM extracts document fields; Error Level Analysis, two-stage copy-move detection and JPEG metadata checks produce a tamper score.',
      'A weighted trust score (0.35 face · 0.25 liveness · 0.25 tamper · 0.15 OCR completeness) sits under hard-fail rules, producing a verdict and a downloadable JSON audit report.',
      'Static INT8 (QDQ) quantisation shipped for detection and embeddings; liveness deliberately stayed FP32 after measurement showed INT8 broke spoof separation — documented, not hidden. Everything is vendored; Playwright E2E asserts the genuine and tampered flows.',
    ],
    results: [
      { value: '−66 %', label: 'model payload (16.6 → 5.6 MB)' },
      { value: '0.85 / −0.01', label: 'genuine vs impostor cosine' },
      { value: '0.998 vs 0.06', label: 'live vs replay liveness probability' },
      { value: '~48 ms', label: 'three models on 2 vCPUs' },
    ],
    stack: ['ONNX Runtime Web', 'WASM', 'Tesseract 5', 'Python (quantisation + eval)', 'Vanilla JS', 'Playwright'],
    liveOverride: 'https://verilens-snowy.vercel.app',
    featured: 4,
    hasScreenshot: true,
  },
  {
    slug: 'staynest',
    title: 'StayNest',
    category: 'web',
    tagline: 'Full-stack Airbnb-style marketplace with a working booking flow and host analytics.',
    summary:
      'Search and filters, rich listing pages with maps and reviews, wishlists, a booking flow with server-validated dates and a live price breakdown, and a host dashboard — on a normalised Supabase Postgres schema.',
    problem:
      'Most “Airbnb clones” stop at a pretty grid. This one had to behave like a product: real accounts and guest mode, bookings that persist and validate on the server, reviews computed from data, and a host view that reports revenue and occupancy from the same tables.',
    approach: [
      'Next.js App Router with API routes for listings, filters and bookings; Supabase Auth with automatic profile creation and a guest mode.',
      'Booking flow with date pickers, guest limits and a live price breakdown; the server rejects past check-ins and invalid ranges.',
      'Sixteen stays across eight categories with 100+ reviews, category-rating breakdowns computed from review data, an OpenStreetMap embed per listing and a sticky booking widget.',
      'Host dashboard with KPIs, a six-month revenue trend and per-listing occupancy; light/dark/system themes with five accent colours; motion throughout.',
    ],
    results: [
      { value: '16', label: 'stays across 8 categories' },
      { value: '100+', label: 'reviews driving computed ratings' },
      { value: '1,200+', label: 'Q&A pairs in the built-in assistant' },
      { value: '32', label: 'commits' },
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase (Postgres + Auth)', 'Tailwind CSS', 'Motion', 'OpenStreetMap'],
    featured: 5,
    hasScreenshot: true,
  },
  {
    slug: 'cityhelp',
    title: 'CityHelp',
    category: 'web',
    tagline: 'Civic platform: report city issues, upvote, and track fixes on a live dashboard and map.',
    summary:
      'Residents report potholes, outages and overflowing bins with a location in seconds, rally support with upvotes, and follow resolutions across wards on a realtime dashboard with 7-day trends, category mix and department workload.',
    problem:
      'Civic complaints disappear into phone lines and paper. The goal was a transparent loop — report, upvote, track — where the city’s health is visible to everyone in real time rather than buried in a department inbox.',
    approach: [
      'Next.js with API routes over Supabase Realtime (PostgreSQL) so new reports and status changes stream to every open dashboard.',
      'Issue reports carry location and category; upvotes surface what matters to a neighbourhood.',
      'A dashboard with Recharts renders 7-day trends, category mix and department workload; a map view places every open issue; a services directory puts every city service in one place.',
    ],
    results: [
      { value: 'Realtime', label: 'Supabase-powered dashboard + map' },
      { value: '7-day', label: 'trends, category mix, department load' },
      { value: '18+', label: 'wards tracked in the demo dataset' },
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase Realtime', 'PostgreSQL', 'Recharts', 'API Routes'],
    featured: 6,
    hasScreenshot: true,
  },
  {
    slug: 'veridoc-studio',
    title: 'VeriDoc Studio',
    category: 'ai',
    tagline: 'Verify Indian identity documents in the browser through an 8-stage pluggable pipeline.',
    summary:
      'Aadhaar, PAN, Driving Licence, Passport or Voter ID go through image-quality scoring, WASM OCR, type classification, field parsing, Verhoeff checksum validation, ONNX face detection and ELA forgery analysis — all client-side, every stage swappable through a model registry.',
    problem:
      'Document intelligence is usually a black-box API. VeriDoc needed to be inspectable and extensible: each verification signal visible, each engine replaceable with a fine-tuned model, and nothing leaving the device.',
    approach: [
      'Eight stages resolve through a ModelRegistry so the OCR engine, classifier, parser, face detector or forgery analyser can be swapped without touching the UI.',
      'Aadhaar numbers are validated with the real Verhoeff checksum UIDAI uses; the parser corrects classic OCR confusions (O→0, I/L→1) with digit-presence guards.',
      'A PyTorch + Hugging Face pipeline in ml/ goes from synthetic cards through LoRA fine-tuning and evaluation to ONNX export back into the browser.',
    ],
    results: [
      { value: '8', label: 'verification stages' },
      { value: '5', label: 'Indian document types' },
      { value: '0', label: 'network calls after load' },
    ],
    stack: ['Tesseract WASM', 'ONNX Runtime Web', 'Vanilla JS', 'PyTorch', 'Hugging Face PEFT/LoRA'],
    hasScreenshot: true,
  },
  {
    slug: 'docuforge',
    title: 'DocuForge',
    category: 'ai',
    tagline: 'Five forensic engines that tell you whether a document is real — entirely client-side.',
    summary:
      'Error Level Analysis, copy-move detection, noise consistency, EXIF forensics and JPEG quantisation analysis run in the browser and fuse into a verdict with a downloadable evidence report; a PyTorch research layer trains on CASIA v2.',
    problem:
      'Forgery detection literature is rarely usable by a person with a suspicious receipt. DocuForge had to make peer-reviewed techniques run in a browser tab with measurable accuracy, not just pretty heatmaps.',
    approach: [
      'Each engine is one vanilla ES2017 module producing a heatmap and a score; a weighted fusion favours spatial evidence.',
      'The exact production engines are benchmarked end-to-end in Chromium with Playwright on a reproducible 64-document dataset, including recompression and noise attacks.',
      'training/ ships an EfficientNet-B0 over ELA maps of CASIA v2 with a full eval harness and model card.',
    ],
    results: [
      { value: '0.947', label: 'ROC-AUC on the clean split' },
      { value: '0.936', label: 'ROC-AUC after JPEG q60 laundering' },
      { value: '5', label: 'forensic engines, zero servers' },
    ],
    stack: ['Vanilla JS', 'Canvas', 'Playwright benchmarks', 'PyTorch', 'EfficientNet-B0'],
    hasScreenshot: true,
  },
  {
    slug: 'nova-ai-assistant',
    title: 'Nova',
    category: 'ai',
    tagline: 'A free, no-signup AI chat assistant with server-side token streaming and expert personas.',
    summary:
      'A ChatGPT-style assistant on a key-less open model: a Next.js route handler streams tokens to the browser as they arrive, five personas carry their own system prompts, and markdown with syntax-highlighted code renders live.',
    problem:
      'The free model endpoint blocks browser requests, rate-limits aggressively, and expects a key-free flow. Nova needed streaming that starts on the first token, resilient retries, and a workspace that feels like a real product without any backend state.',
    approach: [
      'A server route opens the upstream SSE stream, parses deltas and forwards plain-text tokens, returning headers immediately so rendering starts at the first token.',
      'Automatic retries plus a non-streaming fallback absorb free-tier rate limits.',
      'Five personas (Nova, Forge, Quill, Sage, Spark), multi-conversation sidebar, regenerate and stop controls, rich markdown with one-click copy.',
    ],
    results: [
      { value: '5', label: 'expert personas' },
      { value: '0', label: 'API keys or sign-ups' },
      { value: 'SSE', label: 'token streaming proxy' },
    ],
    stack: ['Next.js 14', 'TypeScript', 'Route Handlers', 'Tailwind CSS', 'react-markdown'],
    hasScreenshot: true,
  },
  {
    slug: 'resumeforge',
    title: 'ResumeForge',
    category: 'tools',
    tagline: 'Privacy-first career toolkit: live resume builder, real-time ATS scoring, PDF scanner, cover letters.',
    summary:
      'Build, score and export a resume, scan any PDF against ATS checks, match job descriptions, draft cover letters and track applications — pure HTML/CSS/JS with zero runtime dependencies and no server touching your data.',
    problem:
      'Job seekers fix their resume after the rejection. ResumeForge re-scores every keystroke against recruiter checks so problems are fixed before applying, while keeping every byte of career data on the device.',
    approach: [
      'An 8-check real-time ATS engine plus a 10-check full-text scanner with PDF upload; a job-description keyword matcher shows live coverage.',
      'Nine templates with one-click PDF export, a cover-letter studio with tone presets, an offer analyser and an application tracker with JSON import/export.',
      'The landing page is an interaction showcase of 15+ hand-built components on vendored GSAP + ScrollTrigger.',
    ],
    results: [
      { value: '8 + 10', label: 'ATS checks (live + full-text)' },
      { value: '9', label: 'recruiter-approved templates' },
      { value: '0', label: 'runtime dependencies' },
    ],
    stack: ['HTML', 'CSS', 'Vanilla JS', 'GSAP'],
    hasScreenshot: true,
  },
  {
    slug: 'stillpoint',
    title: 'Stillpoint',
    category: 'web',
    tagline: 'Generative focus environments — soundscapes synthesised live in the browser.',
    summary:
      'Six living worlds, a real focus timer, and soundscapes built from layered noise and randomised events in the Web Audio API — nothing loops, nothing streams. Installable PWA that works offline.',
    problem:
      'Focus apps ship megabytes of looping audio files. Stillpoint describes each world as a recipe of noise beds and event generators so rain never repeats and bandwidth is zero.',
    approach: [
      'White/pink/brown noise beds shaped by biquad filters and slow LFOs; randomly scheduled drops, crackles and chirps panned and enveloped on the fly.',
      '15/25/50/90-minute timers with a breathing progress ring, shareable canvas focus cards, streaks and a 14-week heatmap kept on-device.',
      '~128 KB gzipped JS, respects prefers-reduced-motion, keyboard friendly, structured data and Open Graph.',
    ],
    results: [
      { value: '6', label: 'generative worlds' },
      { value: '0 B', label: 'audio downloaded' },
      { value: '~128 KB', label: 'gzipped JS' },
    ],
    stack: ['React 19', 'TypeScript', 'Vite', 'Web Audio API', 'Tailwind CSS', 'Motion', 'PWA'],
    hasScreenshot: true,
  },
  {
    slug: 'githublens',
    title: 'GitHubLens',
    category: 'web',
    tagline: 'Analyse any GitHub profile: stars, languages, top repos and a developer score.',
    summary:
      'Enter a username and get stat tiles, a language donut, the most-starred repositories and a 0–100 developer score computed from stars, followers, repo count, language diversity and account age — from the live GitHub REST API.',
    problem:
      'Reading a GitHub profile takes ten tabs. GitHubLens collapses it into one view and degrades gracefully around rate limits, missing users and network errors.',
    approach: [
      'Next.js App Router fetching the live REST API with optional token support for higher limits.',
      'Recharts for the language breakdown; a transparent scoring formula surfaced in the UI.',
    ],
    results: [
      { value: '0–100', label: 'developer score' },
      { value: 'Live', label: 'GitHub REST API' },
    ],
    stack: ['Next.js', 'TypeScript', 'GitHub REST API', 'Recharts', 'Tailwind CSS', 'Motion'],
    hasScreenshot: true,
  },
  {
    slug: 'coderunner',
    title: 'CodeRunner',
    category: 'web',
    tagline: 'A typing game for developers — race the clock on real code, build combos, climb the board.',
    summary:
      'Real JavaScript, TypeScript, Python, C and SQL snippets across three difficulty levels with per-character feedback, live WPM/accuracy/combo stats and a ranked leaderboard.',
    problem:
      'Typing tests use prose; developers type brackets, semicolons and indentation. CodeRunner makes the drill match the job and keeps it fully keyboard-driven.',
    approach: [
      'Snippet library across five languages and three levels; combo scoring for clean streaks.',
      'Terminal-green theme with a subtle glow, result screen with WPM, accuracy, max combo and errors.',
    ],
    results: [
      { value: '5', label: 'languages' },
      { value: '3', label: 'difficulty levels' },
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Motion'],
    hasScreenshot: true,
  },
  {
    slug: 'algoviz',
    title: 'AlgoViz',
    category: 'tools',
    tagline: 'Step through six sorting and four pathfinding algorithms one operation at a time.',
    summary:
      'Bubble, Selection, Insertion, Merge, Quick and Heap sort plus BFS, DFS, Dijkstra and A* on an interactive grid — with play/pause/step controls and live comparison and write counts.',
    problem:
      'Complexity tables do not build intuition. AlgoViz records every comparison and mutation as a frame so learners can scrub through an algorithm like a video.',
    approach: [
      'Each algorithm is a step recorder emitting frames; the UI replays them at a controllable speed with spring-animated bars.',
      'Maze generation and wall drawing for the pathfinding grid; complexity metadata per algorithm.',
    ],
    results: [
      { value: '6 + 4', label: 'sorting + pathfinding algorithms' },
      { value: '10–80', label: 'array size range' },
    ],
    stack: ['React 19', 'Vite', 'Tailwind CSS v4', 'Motion'],
    hasScreenshot: true,
  },
  {
    slug: 'cryptolab',
    title: 'CryptoLab',
    category: 'tools',
    tagline: 'Classical ciphers to real Web Crypto — hashing, AES-GCM and RSA, all in-browser.',
    summary:
      'Caesar, Vigenère, Atbash, Rail Fence, XOR and substitution with live alphabet mappings, next to SHA hashing, HMAC, AES-256-GCM with PBKDF2-derived keys and 2048-bit RSA-OAEP key pairs exported to PEM.',
    problem:
      'Cryptography is easier to understand when you can watch a cipher transform text and inspect actual key material — without keys or plaintext leaving the browser.',
    approach: [
      'Every classical cipher round-trips live; modern primitives use the browser’s native Web Crypto API.',
      'AES keys derived with PBKDF2 at 100,000 iterations; wrong passwords fail loudly.',
    ],
    results: [
      { value: '6', label: 'classical ciphers' },
      { value: '2048-bit', label: 'RSA-OAEP key generation' },
    ],
    stack: ['React 19', 'Vite', 'Web Crypto API', 'Tailwind CSS v4', 'Motion'],
    hasScreenshot: true,
  },
  {
    slug: 'spectra',
    title: 'Spectra',
    category: 'tools',
    tagline: 'Colour palettes and CSS gradients, instantly — lock, regenerate, export, share by link.',
    summary:
      'Five-colour palettes from real harmony schemes, a gradient studio with live angle control, exports to CSS variables, Tailwind config or JSON, and palettes that live in the URL.',
    problem: 'Palette tools are either toys or subscriptions. Spectra is a fast, shareable, client-side utility at ~69 KB gzipped.',
    approach: [
      'Analogous, triadic, complementary and monochrome schemes; lock swatches and press space to regenerate the rest.',
      'An interactive Three.js palette orb with a one-tap 3D toggle.',
    ],
    results: [
      { value: '~69 KB', label: 'gzipped' },
      { value: '4', label: 'harmony schemes' },
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Three.js'],
    hasScreenshot: true,
  },
  {
    slug: 'typeflow',
    title: 'Typeflow',
    category: 'tools',
    tagline: 'A clean, minimal typing speed test with shareable result cards.',
    summary:
      'Live WPM, raw speed and accuracy over 15/30/60/120-second tests, per-character feedback with a smooth caret, and a result card designed to be shared.',
    problem: 'Most typing tests are cluttered with ads. Typeflow is ~70 KB, distraction-free and account-free.',
    approach: ['Endless word stream with per-character feedback; a reactive particle background responds as you type.', 'Count-up WPM reveal and a shareable result card.'],
    results: [
      { value: '~70 KB', label: 'gzipped' },
      { value: '4', label: 'test durations' },
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    hasScreenshot: true,
  },
];

export const featuredProjects = projects.filter((p) => p.featured).sort((a, b) => (a.featured ?? 99) - (b.featured ?? 99));
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
