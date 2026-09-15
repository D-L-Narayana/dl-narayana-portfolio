export const site = {
  name: 'D L Narayana',
  shortName: 'DLN',
  title: 'D L Narayana — Data engineer, full-stack & AI product developer',
  description:
    'Portfolio of D L Narayana: real-time CDC lakehouses, PySpark warehouses, multi-agent AI systems and full-stack web products. Visakhapatnam, India.',
  url: 'https://dln-portfolio.vercel.app',
  email: 'nvr0910@gmail.com',
  github: 'https://github.com/D-L-Narayana',
  linkedin: 'https://linkedin.com/in/dlnarayana',
  location: 'Visakhapatnam, India',
  roles: ['Data engineer', 'Full-stack developer', 'AI product engineer'],
  education: 'B.Tech Computer Science & Engineering · GITAM · Class of 2027',
};

export const principles = [
  { title: 'Idempotent pipelines', body: 'Replaying the same offsets or re-running a backfill yields identical tables. Retries are safe by construction, not by hope.' },
  { title: 'Explicit schemas', body: 'Every source is read with a declared StructType. Inference is only used to detect drift and log it before it becomes nulls.' },
  { title: 'Tests for every transform', body: 'One set of transforms powers both the stream and the batch path, so a single pytest suite covers both.' },
  { title: 'Metrics for every run', body: 'JSON structured logs, per-stage timers, quarantine breakdowns and run metrics files — observable by default.' },
];

export const stackGroups: { name: string; items: string[] }[] = [
  { name: 'Data', items: ['Apache Spark', 'PySpark', 'Spark SQL', 'Structured Streaming', 'Apache Kafka', 'Debezium CDC', 'Apache Airflow', 'Parquet lakehouse', 'Star schema · SCD2', 'Data-quality gates', 'PostgreSQL', 'MongoDB', 'Docker Compose', 'pytest'] },
  { name: 'Web', items: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Java', 'SQL', 'Prisma', 'Tailwind CSS', 'Motion', 'Supabase'] },
  { name: 'AI', items: ['LLM integration', 'RAG pipelines', 'Embeddings & vector search', 'AI agents (LangGraph)', 'Evals & guardrails', 'ONNX Runtime Web', 'PyTorch'] },
  { name: 'Fundamentals', items: ['Data structures & algorithms', 'OOP', 'DBMS', 'Operating systems', 'Computer networks', 'System design'] },
  { name: 'Exploring', items: ['Databricks & Delta Lake', 'Snowflake', 'Hadoop / Hive', 'Kafka Streams', 'Data contracts'] },
];

export type TimelineEntry = { date: string; title: string; body: string; href?: string };

export const timeline: TimelineEntry[] = [
  { date: '2026-09', title: 'Data engineering, in public', body: 'Published LakeFlow (real-time CDC lakehouse) and Retail Lakehouse ETL (PySpark batch warehouse), plus AeroSentry — a multi-agent operations layer with a human-in-the-loop safety gate.', href: '/work/lakeflow-cdc-pipeline/' },
  { date: '2026-08', title: 'ResumeForge', body: 'A privacy-first career toolkit with a real-time ATS engine — pure HTML/CSS/JS, zero runtime dependencies, 36 commits over five days.', href: '/work/resumeforge/' },
  { date: '2026-07', title: 'On-device verification trio', body: 'VeriLens, VeriDoc Studio and DocuForge: KYC, Indian document verification and forgery forensics running entirely in the browser on ONNX/WASM.', href: '/work/verilens/' },
  { date: '2026-06', title: 'Ten products in one month', body: 'CityHelp, StayNest, AlgoViz, CryptoLab, GitHubLens, CodeRunner, Stillpoint, Typeflow, Spectra and Nova — each deployed live on Vercel.', href: '/work/' },
  { date: '2025-12', title: 'github.com/D-L-Narayana', body: 'Account created; the public record starts here.', href: 'https://github.com/D-L-Narayana' },
  { date: 'Class of 2027', title: 'B.Tech CSE, GITAM', body: 'Computer Science & Engineering, Class of 2027, Visakhapatnam. CGPA 7.97/10.' },
];
