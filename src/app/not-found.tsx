import type { Metadata } from 'next';
import { TransitionLink } from '@/components/providers/Transition';
import { Magnetic } from '@/components/ui/Magnetic';

export const metadata: Metadata = { title: '404 — route not found', robots: { index: false } };

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80svh] flex-col justify-center py-32">
      <p className="eyebrow mb-6 flex items-center gap-3">
        <span className="text-accent">404</span>
        <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
        route not found
      </p>
      <h1 className="display serif-em">
        This row failed the <em>quality gate</em>.
      </h1>
      <p className="lead mt-8">The page you asked for is not in the sitemap. It has been quarantined with a reason — you can head back to a known-good route.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Magnetic>
          <TransitionLink href="/" className="btn btn-primary">
            Home
          </TransitionLink>
        </Magnetic>
        <Magnetic>
          <TransitionLink href="/work/" className="btn btn-ghost">
            All work
          </TransitionLink>
        </Magnetic>
      </div>
    </section>
  );
}
