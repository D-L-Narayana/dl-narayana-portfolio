const WIDTHS = [480, 800, 1200];

type Props = {
  base: string; // e.g. /images/projects/staynest
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/** Pre-generated AVIF/WebP renditions (see scripts/optimize-images.mjs). 16:10 intrinsic box. */
export function Picture({ base, alt, sizes = '(min-width: 1024px) 60vw, 100vw', priority = false, className }: Props) {
  const set = (ext: string) => WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`${base}-800.webp`}
        srcSet={set('webp')}
        sizes={sizes}
        width={1200}
        height={750}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
}
