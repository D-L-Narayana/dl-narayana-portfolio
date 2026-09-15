/**
 * Engineering notes. Each one is distilled from a public repository's README and design — the
 * numbers are the repositories' own, never rounded up. Inline syntax in strings: `code`, **strong**,
 * [text](href). Code blocks are labelled pattern sketches, not copies of repository code.
 */
export type Block =
  | { t: 'p'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'code'; lang: string; code: string; caption?: string }
  | { t: 'callout'; text: string };

export type Note = {
  slug: string;
  title: string;
  dek: string;
  date: string; // ISO
  project: string; // project slug
  tags: string[];
  seed: number; // procedural cover
  blocks: Block[];
};

export const notes: Note[] = [
  {
    slug: 'one-transform-set-stream-and-backfill',
    title: 'One set of transforms, two paths',
    dek: 'LakeFlow’s streaming path and its nightly backfill run the same code, so one pytest suite proves both. That mattered more than the throughput number.',
    date: '2026-09-15T09:00:00Z',
    project: 'lakeflow-cdc-pipeline',
    tags: ['Spark Structured Streaming', 'CDC', 'Idempotency'],
    seed: 11,
    blocks: [
      { t: 'p', text: 'Most streaming systems grow a second code path the first time something goes wrong. The stream misses a day, someone writes a batch job to “fix yesterday”, and from then on the two paths drift: the backfill fixes yesterday and quietly reintroduces last month’s bug. LakeFlow was built so that this cannot happen.' },
      { t: 'h2', text: 'What the pipeline does' },
      { t: 'p', text: 'PostgreSQL runs with logical WAL and `REPLICA IDENTITY FULL`, so Debezium emits complete before/after images for every insert, update and delete. Kafka (KRaft) carries one topic per table. Spark Structured Streaming appends the raw envelope to an immutable **Bronze** layer — checkpointed, partitioned by table and ingest date, exactly-once at the sink.' },
      { t: 'p', text: '**Silver** is derived inside `foreachBatch`: latest-per-key on the WAL commit order (`ts_ms`, then `lsn`), deletes honoured, and the customers table versioned as SCD Type 2. Rows that fail declarative rules land in a quarantine table with the names of the rules they failed. **Gold** marts — daily revenue, product ranks, customer lifetime value — are Spark SQL.' },
      { t: 'h2', text: 'The one decision that holds it together' },
      { t: 'p', text: 'Every Silver and Gold transform is a plain function from DataFrame to DataFrame. The stream calls them once per micro-batch. The Airflow backfill calls the same functions over a range of Bronze partitions. Nothing in the transforms knows which path invoked it, so the seven pytest tests exercise the logic once and cover both.' },
      {
        t: 'code',
        lang: 'python',
        caption: 'Pattern sketch — the shape of the idea, not the repository’s exact code.',
        code: `def to_silver(bronze: DataFrame) -> DataFrame:
    w = Window.partitionBy("id").orderBy(F.col("ts_ms").desc(), F.col("lsn").desc())
    latest = bronze.withColumn("rn", F.row_number().over(w)).filter("rn = 1")
    return latest  # deletes carry op == "d" and are applied by upsert()

# streaming path — one micro-batch at a time
(bronze_stream.writeStream
    .foreachBatch(lambda df, _: upsert(to_silver(df)))
    .option("checkpointLocation", ckpt)
    .start())

# backfill path — the same function over a partition range (Airflow)
upsert(to_silver(spark.read.parquet(bronze_path).where(ingest_day.between(start, end))))`,
      },
      { t: 'h2', text: 'Why replay is safe' },
      { t: 'p', text: 'Upserts are keyed by the business key and ordered by commit position, so replaying the same offsets — or re-running a backfill over the same days — produces identical tables. If a micro-batch fails halfway, the checkpoint replays it and the upsert absorbs the duplicates. Idempotency is a property of the design, not a retry policy.' },
      { t: 'callout', text: 'Measured on 2 vCPUs: **510,663** CDC events replayed end-to-end into Gold in **29.5 s** (~17.3K events/s), with **5,239** rows quarantined — each with the rule that rejected it.' },
      { t: 'p', text: 'The throughput is a by-product. The thing that holds is the discipline: one transform set, explicit schemas, a test for every transform, and metrics for every run.' },
    ],
  },
  {
    slug: 'fail-the-run-not-the-row',
    title: 'Fail the run, not the row',
    dek: 'Retail Lakehouse ETL reads a million defective sales lines. Its quality gate quarantines bad rows with a reason and only stops the job when the share crosses a threshold.',
    date: '2026-09-15T09:20:00Z',
    project: 'retail-lakehouse-etl',
    tags: ['PySpark', 'Data quality', 'Star schema'],
    seed: 23,
    blocks: [
      { t: 'p', text: 'A warehouse built on raw retail feeds silently mis-attributes revenue unless the bad data is caught, quarantined and reported. The feeds in this project are deliberately hostile: month-partitioned JSON with malformed lines, duplicate sale IDs, null foreign keys and two timestamp formats.' },
      { t: 'h2', text: 'Read with a schema, never infer' },
      { t: 'p', text: 'Every source is read with an explicit `StructType` in `PERMISSIVE` mode, so a corrupt line does not kill the job — it is captured in `_corrupt_record` and counted. Schema drift is detected on a sample and logged *before* it turns into a column of nulls. In the reference run, **981** corrupt lines were captured this way.' },
      { t: 'h2', text: 'Deduplicate deterministically' },
      { t: 'p', text: 'Duplicates are removed with `row_number()` over a total ordering, so re-running the job on the same input keeps the same row every time. **9,993** duplicate sale lines were dropped, and a second run would drop exactly the same ones.' },
      { t: 'h2', text: 'Eight rules, one gate' },
      { t: 'p', text: 'Data-quality rules are declarative — a name and a condition — and produce a per-rule breakdown plus a quarantine table. The job does not fail because a row is wrong; it fails when the quarantined share crosses a threshold. That distinction is the whole point: one bad supplier file should not block the month, but a broken upstream export should.' },
      {
        t: 'code',
        lang: 'python',
        caption: 'Pattern sketch — declarative rules folded into a quarantine table.',
        code: `RULES = [
    ("non_null_customer", F.col("customer_id").isNotNull()),
    ("positive_quantity", F.col("quantity") > 0),
    ("known_product", F.col("product_id").isin(known_products)),
    # …five more
]

def gate(df: DataFrame) -> tuple[DataFrame, DataFrame]:
    bad = None
    for name, cond in RULES:
        failed = df.filter(~cond).withColumn("rule", F.lit(name))
        bad = failed if bad is None else bad.unionByName(failed)
    good = df.filter(reduce(lambda a, b: a & b, [c for _, c in RULES]))
    return good, bad  # per-rule counts come from bad.groupBy("rule").count()`,
      },
      { t: 'h2', text: 'Model history, not just state' },
      { t: 'p', text: 'Dimensions carry SCD Type 2 validity windows and the fact table joins on the version that was valid at order time, so a customer’s segment change never rewrites last quarter. The fact is Hive-partitioned by year and month so Hive, Athena, Synapse or Databricks can query it in place. Marts use `LAG`, `DENSE_RANK` and cumulative windows; the MongoDB serving loads are idempotent upserts.' },
      { t: 'callout', text: '**1,009,989** raw lines read, **50.9 s** end-to-end (~19.8K rows/s), **1.30 %** quarantined with a per-rule breakdown, five tests, and a JSON run-metrics file for every execution.' },
    ],
  },
  {
    slug: 'when-int8-was-the-wrong-answer',
    title: 'When INT8 was the wrong answer',
    dek: 'Quantising VeriLens cut the model payload by two thirds. Then the liveness model lost the ability to tell a face from a photo of one — so it stayed FP32.',
    date: '2026-09-15T09:40:00Z',
    project: 'verilens',
    tags: ['ONNX Runtime Web', 'Quantisation', 'Computer vision'],
    seed: 37,
    blocks: [
      { t: 'p', text: 'VeriLens is a KYC suite that runs entirely in the browser: face detection, face matching, passive liveness, OCR and tamper forensics on ONNX Runtime Web and Tesseract WASM. Nothing leaves the device — which means every model has to be downloaded to the device, and payload size becomes a product feature.' },
      { t: 'h2', text: 'The obvious win' },
      { t: 'p', text: 'Static INT8 quantisation (QDQ format) for UltraFace RFB-320 detection and MobileFaceNet embeddings brought the model payload from **16.6 MB to 5.6 MB** — a 66 % cut — with the face-match margin intact: genuine pairs still land around cosine **0.85** while impostors sit near **−0.01**.' },
      { t: 'h2', text: 'The one that broke' },
      { t: 'p', text: 'MiniFASNetV2 scores passive liveness with three-crop test-time augmentation. In FP32 it separates a live face (p ≈ **0.998**) from a replayed photo (p ≈ **0.06**) by a comfortable margin. Quantised to INT8, that separation collapsed. The headline accuracy on easy cases barely moved; the *margin* on the cases that matter did.' },
      { t: 'callout', text: 'Accuracy is a summary. Decisions are made on margins. Quantise per model, and measure the separation you actually threshold on — not a benchmark average.' },
      { t: 'h2', text: 'What shipped' },
      { t: 'ul', items: ['Detection and embeddings in INT8; liveness deliberately kept in FP32, with the measurement written down in the README rather than hidden.', 'A weighted trust score — 0.35 face · 0.25 liveness · 0.25 tamper · 0.15 OCR completeness — under hard-fail rules, producing a verdict and a downloadable JSON audit report.', 'About **48 ms** for the three models on two vCPUs.', 'Everything vendored; Playwright end-to-end tests assert both the genuine flow and the tampered flow.'] },
      { t: 'p', text: 'The lesson generalises beyond faces. Whenever a model feeds a threshold, the quantity to protect is the distance between the classes on either side of it. Payload budgets are real, but a 5.6 MB download that cannot tell a photo from a person is not a smaller product — it is a different one.' },
    ],
  },
  {
    slug: 'agents-that-act-need-a-gate',
    title: 'Agents that act need a gate that says no',
    dek: 'AeroSentry lets AI agents schedule, inspect and alert on drone fleets — and stops every high-risk action at a deterministic policy check and a human approval.',
    date: '2026-09-15T10:00:00Z',
    project: 'aerosentry-agents',
    tags: ['LangGraph', 'Human-in-the-loop', 'Evals'],
    seed: 41,
    blocks: [
      { t: 'p', text: 'Agentic systems that only suggest are safe but useless. Agents that act are useful but dangerous. Drone operations need something that can schedule, inspect and alert on its own, yet can never launch, abort or escalate without a policy check and an operator’s explicit approval.' },
      { t: 'h2', text: 'Shape of the system' },
      { t: 'p', text: 'A LangGraph supervisor loads persistent SQLite memory and routes each request to one of three specialists — planner, analyst, knowledge. Agents run a ReAct tool loop over Pydantic-validated Python functions: telemetry, weather, geofence, schedule, abort. Validation at the tool boundary means a malformed argument fails loudly before it touches anything real.' },
      { t: 'p', text: 'The knowledge agent answers from operator manuals and incident logs through hybrid retrieval — BM25 and dense embeddings fused with Reciprocal Rank Fusion — and cites what it used. The analyst reads aerial thermal frames with a vision-language model and falls back to a deterministic numpy hotspot detector; an alert’s severity has to be backed by imagery evidence.' },
      { t: 'h2', text: 'The gate' },
      { t: 'p', text: 'Before any high-risk action, a safety gate applies hard policy checks — battery floor, wind limit, geofence, altitude ceiling — in plain code, not in a prompt. If the action survives the checks, the graph *interrupts*: state is persisted and nothing proceeds until a human approves via the API, the console or the CLI. Approval is first-class graph state, not a chat message the model is asked to wait for.' },
      { t: 'callout', text: 'Determinism where it matters, language models where they help. Policy lives in code and is tested; the LLM plans, explains and retrieves.' },
      { t: 'h2', text: 'Proving it keeps working' },
      { t: 'ul', items: ['Every LLM call, tool call, routing decision and verdict is traced to JSONL (LangSmith optional).', 'A golden-set evaluation harness scores routing accuracy, tool-call accuracy, HITL gating and p50/p95 latency — and runs in CI.', '17 offline tests, FastAPI service, Docker image, GitHub Actions.'] },
      { t: 'p', text: 'The evals matter most for the gate itself. A regression that lets one high-risk action through unapproved is not a quality dip; it is the failure the whole system exists to prevent, so it is the first thing the suite checks.' },
    ],
  },
  {
    slug: 'zero-inference-apis',
    title: 'Zero inference APIs: ML in the browser tab',
    dek: 'VeriLens, VeriDoc Studio and DocuForge run detection, OCR and forensics client-side. What it took to make “the document never leaves the device” true.',
    date: '2026-09-15T10:20:00Z',
    project: 'veridoc-studio',
    tags: ['WebAssembly', 'ONNX', 'Forensics'],
    seed: 53,
    blocks: [
      { t: 'p', text: 'Document intelligence is usually a black-box API: upload the passport, receive a verdict. Three of my projects take the opposite constraint — every stage runs in the browser and, after the initial load, there are **zero** network calls. The constraint shaped almost every engineering decision.' },
      { t: 'h2', text: 'Make every stage replaceable' },
      { t: 'p', text: 'VeriDoc Studio verifies Aadhaar, PAN, Driving Licence, Passport and Voter ID through eight stages — image-quality scoring, WASM OCR, type classification, field parsing, checksum validation, ONNX face detection and ELA forgery analysis. Every stage resolves through a `ModelRegistry`, so the OCR engine, the classifier or the face detector can be swapped for a fine-tuned model without touching the UI.' },
      { t: 'p', text: 'Aadhaar numbers are validated with the real Verhoeff checksum UIDAI uses, and the parser corrects the classic OCR confusions (O→0, I/L→1) behind digit-presence guards so it never “corrects” a genuine letter.' },
      { t: 'h2', text: 'Benchmark the exact engines you ship' },
      { t: 'p', text: 'DocuForge runs five forensic engines — Error Level Analysis, copy-move detection, noise consistency, EXIF forensics and JPEG quantisation analysis — each a vanilla ES2017 module producing a heatmap and a score, fused with a weighting that favours spatial evidence. The important part is how it is measured: the *production* engines run end-to-end in Chromium under Playwright against a reproducible 64-document dataset, including recompression and noise attacks.' },
      { t: 'callout', text: 'ROC-AUC **0.947** on the clean split and **0.936** after JPEG q60 laundering — measured on the code that ships, not on a Python re-implementation of it.' },
      { t: 'h2', text: 'Keep a research path back into the browser' },
      { t: 'p', text: 'Both projects carry a PyTorch layer: DocuForge trains an EfficientNet-B0 over ELA maps of CASIA v2 with an evaluation harness and a model card; VeriDoc goes from synthetic cards through LoRA fine-tuning to ONNX export. The loop closes when a trained model drops back into the registry and the same Playwright suite decides whether it earned its place.' },
      { t: 'ul', items: ['Payload is a budget line — see [When INT8 was the wrong answer](/notes/when-int8-was-the-wrong-answer/).', 'Everything is vendored; a CDN outage cannot break a verification.', 'End-to-end tests are the accuracy gate, because the browser is the runtime.'] },
    ],
  },
];

export const getNote = (slug: string) => notes.find((n) => n.slug === slug);

export function readingMinutes(n: Note) {
  const words = n.blocks
    .map((b) => (b.t === 'ul' ? b.items.join(' ') : b.t === 'code' ? b.code : b.text))
    .join(' ')
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}
