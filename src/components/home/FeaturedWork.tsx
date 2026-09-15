import { TransitionLink } from '@/components/providers/Transition';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { featured, stats } from '@/lib/github';
import { ProjectRow } from './ProjectRow';

export function FeaturedWork() {
  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="container">
        <SectionHeader
          index="01"
          eyebrow="Selected work"
          title={
            <span id="work-title">
              Six systems, <em>shipped</em>.
            </span>
          }
          aside={
            <p className="text-muted">
              Every card is a public repository with its own README, tests and, where it makes sense, a live deployment.{' '}
              <TransitionLink href="/work/" className="link-underline text-text">
                All {stats.publicRepos} projects →
              </TransitionLink>
            </p>
          }
        />
        <div>
          {featured.map((p, i) => (
            <ProjectRow key={p.slug} project={p} index={i} flip={i % 2 === 1} fetchedAt={stats.fetchedAt} priority={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
