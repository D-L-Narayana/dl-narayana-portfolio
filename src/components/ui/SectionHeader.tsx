import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

type Props = { index: string; eyebrow: string; title: ReactNode; aside?: ReactNode; className?: string; titleAs?: 'h1' | 'h2' };

/** Numbered ledger header: `01 / Selected work` eyebrow, serif title, optional right-hand aside. */
export function SectionHeader({ index, eyebrow, title, aside, className = '', titleAs = 'h2' }: Props) {
  const Title = titleAs;
  return (
    <div className={`hairline pt-6 md:pt-8 mb-10 md:mb-16 ${className}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span className="text-accent">{index}</span>
            <span aria-hidden className="inline-block h-px w-6 bg-border-strong" />
            {eyebrow}
          </p>
          <Title className="title serif-em max-w-[18ch]">{title}</Title>
        </Reveal>
        {aside && (
          <Reveal delay={0.08} className="md:max-w-[34ch] md:text-right">
            {aside}
          </Reveal>
        )}
      </div>
    </div>
  );
}
