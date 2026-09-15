import { TransitionLink } from '@/components/providers/Transition';
import { Picture } from '@/components/ui/Picture';
import { SystemDiagram } from '@/components/ui/SystemDiagram';
import { CATEGORY_LABEL } from '@/data/projects';
import type { Project } from '@/lib/github';

/** Big "next case study" hand-off at the foot of every project page. */
export function NextProject({ project: p, prev }: { project: Project; prev: Project }) {
  return (
    <nav className="shell mt-24 md:mt-32" aria-label="Adjacent projects">
      <div className="hairline flex items-baseline justify-between gap-6 pt-6">
        <p className="eyebrow">Next case study</p>
        <TransitionLink href={`/work/${prev.slug}/`} className="link-underline text-sm text-muted hover:text-text" label={prev.title}>
          ← {prev.title}
        </TransitionLink>
      </div>
      <TransitionLink href={`/work/${p.slug}/`} className="group mt-8 grid gap-8 md:grid-cols-12 md:items-center" data-cursor="view" label={p.title}>
        <div className="md:col-span-5">
          <p className="eyebrow">{CATEGORY_LABEL[p.category]}</p>
          <p className="mt-4 font-display text-[clamp(2.25rem,1.5rem+3vw,4.5rem)] leading-[0.98] tracking-tight">
            <span className="link-underline">{p.title}</span>
          </p>
          <p className="mt-5 max-w-[40ch] text-muted">{p.tagline}</p>
          <p className="mt-6 inline-flex items-center gap-2 font-medium">
            Open case study <span className="arrow transition-transform group-hover:translate-x-1" aria-hidden>→</span>
          </p>
        </div>
        <div className="media aspect-[16/10] md:col-span-7">
          <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
            {p.image ? <Picture base={p.image} alt={`${p.title} — screenshot`} sizes="(min-width: 768px) 58vw, 100vw" className="h-full w-full" /> : p.diagram ? <SystemDiagram diagram={p.diagram} title={p.title} /> : null}
          </div>
        </div>
      </TransitionLink>
    </nav>
  );
}
