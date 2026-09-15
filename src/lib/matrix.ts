import { stackGroups } from '@/data/content';
import type { Project } from './github';

export type Group = 'data' | 'web' | 'ai' | 'tools';

/** Canonical technology names: version numbers and parentheticals stripped, aliases merged. */
const ALIAS: Record<string, string> = {
  'Next.js 14': 'Next.js',
  'React 19': 'React',
  'Tailwind CSS v4': 'Tailwind CSS',
  'Python 3.12': 'Python',
  'Python (quantisation + eval)': 'Python',
  'Supabase (Postgres + Auth)': 'Supabase',
  'Supabase Realtime': 'Supabase',
  'Hybrid RAG (BM25 + dense, RRF)': 'Hybrid RAG',
  'Vanilla JS': 'JavaScript',
  'Tesseract 5': 'Tesseract OCR',
  'Tesseract WASM': 'Tesseract OCR',
  'Playwright benchmarks': 'Playwright',
  'Docker Compose': 'Docker',
  'Hugging Face PEFT/LoRA': 'Hugging Face',
  'Route Handlers': 'Next.js',
  'API Routes': 'Next.js',
  'Web Audio API': 'Web Audio',
  'Web Crypto API': 'Web Crypto',
  'Structured Streaming': 'Spark Streaming',
  WASM: 'WebAssembly',
};
const DROP = new Set(['HTML', 'CSS', 'EfficientNet-B0', 'Canvas', 'PWA', 'SQLite', 'OpenStreetMap', 'react-markdown', 'GitHub REST API']);

const GROUP_OF: Record<string, Group> = {
  PySpark: 'data', 'Spark SQL': 'data', 'Spark Streaming': 'data', Kafka: 'data', Debezium: 'data', PostgreSQL: 'data', Parquet: 'data', Airflow: 'data', MongoDB: 'data', Docker: 'data', pytest: 'data', Python: 'data',
  'Next.js': 'web', TypeScript: 'web', React: 'web', 'Tailwind CSS': 'web', Motion: 'web', Supabase: 'web', Vite: 'web', JavaScript: 'web', Recharts: 'web', 'Three.js': 'web',
  LangGraph: 'ai', Pydantic: 'ai', FastAPI: 'ai', 'Hybrid RAG': 'ai', 'ONNX Runtime Web': 'ai', WebAssembly: 'ai', 'Tesseract OCR': 'ai', PyTorch: 'ai', 'Hugging Face': 'ai',
  Playwright: 'tools', GSAP: 'tools', 'GitHub Actions': 'tools', 'Web Audio': 'tools', 'Web Crypto': 'tools',
};

export function canon(raw: string): string | null {
  const a = ALIAS[raw] ?? raw.replace(/\s+\d+(\.\d+)?$/, '').replace(/\s*\(.*\)$/, '').trim();
  if (DROP.has(a)) return null;
  return a;
}

export type MatrixRow = { tech: string; group: Group; used: boolean[]; total: number };
export type Matrix = { rows: MatrixRow[]; cols: { slug: string; title: string; short: string }[] };

const SHORT: Record<string, string> = { 'Retail Lakehouse ETL': 'Retail ETL', 'VeriDoc Studio': 'VeriDoc', 'Nova': 'Nova', 'ResumeForge': 'ResumeForge' };

/** Technology × project ledger from every project's declared stack, most-used first. */
export function buildMatrix(projects: Project[], limit = 18): Matrix {
  const cols = projects.map((p) => ({ slug: p.slug, title: p.title, short: SHORT[p.title] ?? p.title }));
  const sets = projects.map((p) => new Set(p.stack.map(canon).filter((x): x is string => !!x)));
  const all = new Set<string>();
  sets.forEach((s) => s.forEach((t) => all.add(t)));
  const rows: MatrixRow[] = Array.from(all)
    .map((tech) => {
      const used = sets.map((s) => s.has(tech));
      return { tech, group: GROUP_OF[tech] ?? 'tools', used, total: used.filter(Boolean).length };
    })
    .filter((r) => r.total >= 1)
    .sort((a, b) => b.total - a.total || a.tech.localeCompare(b.tech))
    .slice(0, limit);
  return { rows, cols };
}

export const GROUP_LABEL: Record<Group, string> = { data: 'Data', web: 'Web', ai: 'AI', tools: 'Tooling' };

/** Sanity: every stack group item that maps to a canonical row is represented (used by the QA script). */
export const knownStack = new Set(stackGroups.flatMap((g) => g.items));
