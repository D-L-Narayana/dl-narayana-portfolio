'use client';

export function BackToTop() {
  const go = () => {
    const l = window.__lenis;
    if (l) l.scrollTo(0, { duration: 1.1 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    (document.getElementById('main') as HTMLElement | null)?.focus({ preventScroll: true });
  };
  return (
    <button type="button" onClick={go} className="link-underline inline-flex items-center gap-2 text-sm text-muted hover:text-text" aria-label="Back to top">
      Back to top <span aria-hidden>↑</span>
    </button>
  );
}
