import type { Metadata } from 'next';
import { WorkGrid } from '@/components/work/WorkGrid';
import { allProjects, stats } from '@/lib/github';

export const metadata: Metadata = {
  title: 'Work',
  description: 'All public projects by D L Narayana — data pipelines, AI systems, full-stack products and tools, driven by live GitHub data.',
  alternates: { canonical: '/work/' },
  openGraph: { title: 'Work — D L Narayana', description: 'Data pipelines, AI systems, full-stack products and tools.', url: '/work/' },
};

export default function WorkPage() {
  return (
    <section className="shell section pt-32 md:pt-40">
      <div className="hairline pt-8 md:pt-10">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="text-accent">{stats.publicRepos}</span>
          <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
          public projects
        </p>
        <h1 className="display serif-em">
          Work, <em>indexed</em>.
        </h1>
        <p className="lead mt-8">
          Every project below is a public repository. Cards carry the language, last push and a live link when one exists. Filter by the kind of problem.
        </p>
      </div>
      <WorkGrid projects={allProjects} fetchedAt={stats.fetchedAt} />
    </section>
  );
}
