// Footnote links and their back-links glide to their target, like the up button (src/components/ThemeSwitch.js);
// reduced motion jumps. Scoped to footnotes: smooth scrolling site-wide would also glide Docusaurus's scroll to
// the top on every page change.
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const link = e.target instanceof Element && e.target.closest('a[data-footnote-ref], a[data-footnote-backref]');
    const target = link && document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    e.stopPropagation();
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, true);
}
