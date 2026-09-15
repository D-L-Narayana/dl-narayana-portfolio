import { TransitionLink } from '@/components/providers/Transition';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { featured, stats, toStackProject } from '@/lib/github';
import { ProjectStack } from './ProjectStack';

export function FeaturedWork() {
  return (
    <section id="work" className="section !pb-0" aria-labelledby="work-title">
      <div className="shell">
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
              <TransitionLink href="/work/" className="link-underline text-text" label="Work">
                All {stats.publicRepos} projects →
              </TransitionLink>
            </p>
          }
        />
        <ProjectStack projects={featured.map(toStackProject)} fetchedAt={stats.fetchedAt} />
      </div>
    </section>
  );
}
