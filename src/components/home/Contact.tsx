import { Magnetic } from '@/components/ui/Magnetic';
import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/data/content';
import { ContactForm } from './ContactForm';

export function Contact({ full = false }: { full?: boolean }) {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <div className="hairline grid gap-12 pt-8 md:grid-cols-12 md:pt-10">
          <div className="md:col-span-6">
            <Reveal>
              <p className="eyebrow mb-6 flex items-center gap-3">
                <span className="text-accent">{full ? '01' : '06'}</span>
                <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
                Contact
              </p>
              <h2 id="contact-title" className="display serif-em !text-[clamp(2.5rem,1.2rem+4.4vw,5.5rem)]">
                Let&rsquo;s build something that <em>holds</em>.
              </h2>
              <p className="lead mt-8">
                Data engineering, full-stack or AI product work — internships, roles, collaborations. I read every message and reply from {site.email}.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <a href={`mailto:${site.email}`} className="btn btn-primary">
                    {site.email}
                    <span className="arrow" aria-hidden>
                      ↗
                    </span>
                  </a>
                </Magnetic>
                <Magnetic>
                  <a href={site.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">
                    LinkedIn
                    <span className="arrow" aria-hidden>
                      ↗
                    </span>
                  </a>
                </Magnetic>
                <Magnetic>
                  <a href={site.github} target="_blank" rel="noreferrer" className="btn btn-ghost">
                    GitHub
                    <span className="arrow" aria-hidden>
                      ↗
                    </span>
                  </a>
                </Magnetic>
              </div>
            </Reveal>
          </div>
          <Reveal className="md:col-span-5 md:col-start-8" delay={0.1}>
            <ContactForm email={site.email} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
