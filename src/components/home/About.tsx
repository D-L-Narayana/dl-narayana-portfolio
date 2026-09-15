import type { CSSProperties, ReactNode } from 'react';
import { TransitionLink } from '@/components/providers/Transition';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { now, principles, site, stackGroups } from '@/data/content';

export function About({ full = false }: { full?: boolean }) {
  const exploring = stackGroups.find((g) => g.name === 'Exploring')?.items ?? [];
  const Label = full ? 'h2' : 'h3';
  const Sub = full ? 'h3' : 'h4';
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="shell">
        <SectionHeader
          titleAs={full ? 'h1' : 'h2'}
          index={full ? '01' : '03'}
          eyebrow="About"
          title={
            <span id="about-title">
              Real products, <em>not demos</em>.
            </span>
          }
        />
        <div className="grid gap-12 md:grid-cols-12">
          <div data-reveal className="prose md:col-span-7 md:pr-8">
            <p>
              I&rsquo;m a computer-science student in Visakhapatnam who would rather ship a working system than a slide about one. Over the last year that has meant end-to-end <strong>data pipelines</strong> — change-data-capture from PostgreSQL through Debezium and Kafka into Spark Structured Streaming, batch ETL into star-schema warehouses with SCD Type 2 history, data-quality gates, Airflow orchestration and idempotent, observable jobs.
            </p>
            <p>
              It has also meant <strong>products</strong>: authentication, REST APIs, relational data models and polished front-ends — increasingly with AI at the core, from a LangGraph multi-agent operations layer with a human-in-the-loop safety gate to KYC and document forensics that run entirely on-device with ONNX and WASM.
            </p>
            <p>
              Ask me about Spark internals (lazy evaluation, shuffles, broadcast joins, <code className="mono text-[0.9em] text-text">foreachBatch</code>, checkpoints), Kafka and CDC semantics, dimensional modelling, data-quality strategy, SQL window functions, Next.js and React architecture, or shipping LLM features to production — RAG, agents, evals.
            </p>
            {full && (
              <p>
                Currently exploring {exploring.slice(0, -1).join(', ')} and {exploring.at(-1)}. Fundamentals I keep sharp: data structures and algorithms, OOP, DBMS, operating systems, computer networks and system design.
              </p>
            )}
            {!full && (
              <p>
                <TransitionLink href="/about/" className="link-underline text-text">
                  More about how I work →
                </TransitionLink>
              </p>
            )}
          </div>

          <div data-reveal style={{ '--d': '120ms' } as CSSProperties} className="md:col-span-5">
            <dl className="hairline text-sm">
              <Row k="Name" v="D L Narayana" />
              <Row k="Based in" v={site.location} />
              <Row k="Education" v={site.education} />
              <Row k="Roles" v={site.roles.join(' · ')} />
              <Row k="Exploring" v={exploring.join(' · ')} />
              <Row k="CGPA" v={site.cgpa} />
              <Row k="Résumé" v={<TransitionLink href="/resume/" className="link-underline" label="Résumé">One page, printable →</TransitionLink>} />
              <Row k="GitHub" v={<a href={site.github} className="link-underline" target="_blank" rel="noreferrer">github.com/D-L-Narayana ↗</a>} />
              <Row k="LinkedIn" v={<a href={site.linkedin} className="link-underline" target="_blank" rel="noreferrer">linkedin.com/in/dlnarayana ↗</a>} />
            </dl>
          </div>
        </div>

        {full && (
          <div className="mt-20">
            <Label className="eyebrow mb-6">Now — what the work is about</Label>
            <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2" role="list">
              {now.map((n, i) => (
                <li key={n.title} data-reveal style={{ '--i': i } as CSSProperties} className="grid grid-cols-[2.5rem_1fr] gap-3 border-t border-border pt-5">
                  <span className="mono pt-1 text-xs text-accent">0{i + 1}</span>
                  <div>
                    <Sub className="font-sans text-lg font-semibold tracking-normal">{n.title}</Sub>
                    <p className="mt-2 text-sm text-muted">{n.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-20">
          <Label className="eyebrow mb-6">Working principles</Label>
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4" role="list">
            {principles.map((p, i) => (
              <li key={p.title} data-reveal style={{ '--i': i } as CSSProperties} className="bg-surface p-6 md:p-7">
                <span className="mono text-xs text-accent">0{i + 1}</span>
                <Sub className="mt-4 font-sans text-lg font-semibold tracking-normal">{p.title}</Sub>
                <p className="mt-3 text-sm text-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-border py-3">
      <dt className="eyebrow self-baseline">{k}</dt>
      <dd className="col-span-2 text-text">{v}</dd>
    </div>
  );
}
