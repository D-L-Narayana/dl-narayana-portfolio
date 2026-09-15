import type { ReactNode } from 'react';
import { TransitionLink } from '@/components/providers/Transition';
import { Item, Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { principles, site, stackGroups } from '@/data/content';

export function About({ full = false }: { full?: boolean }) {
  const exploring = stackGroups.find((g) => g.name === 'Exploring')?.items ?? [];
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <SectionHeader
          index={full ? '01' : '03'}
          eyebrow="About"
          title={
            <span id="about-title">
              Real products, <em>not demos</em>.
            </span>
          }
        />
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="prose md:col-span-7 md:pr-8">
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
          </Reveal>

          <Reveal className="md:col-span-5" delay={0.1}>
            <dl className="hairline text-sm">
              <Row k="Name" v="D L Narayana" />
              <Row k="Based in" v={site.location} />
              <Row k="Education" v={site.education} />
              <Row k="Roles" v={site.roles.join(' · ')} />
              <Row k="Exploring" v={exploring.join(' · ')} />
              <Row k="GitHub" v={<a href={site.github} className="link-underline" target="_blank" rel="noreferrer">github.com/D-L-Narayana ↗</a>} />
              <Row k="LinkedIn" v={<a href={site.linkedin} className="link-underline" target="_blank" rel="noreferrer">linkedin.com/in/dlnarayana ↗</a>} />
            </dl>
          </Reveal>
        </div>

        <div className="mt-20">
          <p className="eyebrow mb-6">Working principles</p>
          <RevealGroup as="ol" className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <Item key={p.title} as="li" className="bg-surface p-6 md:p-7">
                <span className="mono text-xs text-accent">0{i + 1}</span>
                <h3 className="mt-4 font-sans text-lg font-semibold tracking-normal">{p.title}</h3>
                <p className="mt-3 text-sm text-muted">{p.body}</p>
              </Item>
            ))}
          </RevealGroup>
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
