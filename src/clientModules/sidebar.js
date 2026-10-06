// Docs sidebar collapse/expand (desktop). Two fixes to Docusaurus's DocRoot/Layout/Sidebar:
// 1. It hides the sidebar on *any* transitionend that bubbles to the <aside>, so a child's short transition
//    (e.g. the chevron's opacity) hid the menu and its bottom rule mid-slide. Only the aside's own width counts.
// 2. Collapsing widens the doc, so the page gets shorter. If you were at the bottom, stay pinned there
//    for the whole slide (scroll anchoring off), so the footer holds still while the text reflows above it.
const ASIDE = '.theme-doc-sidebar-container';
const TOGGLE = "button[class*='collapseSidebarButton'], [role='button'][class*='expandButton']";
const SLIDE = 450; // ms, a little over the width transition in custom.css

if (typeof window !== 'undefined') {
  document.addEventListener('transitionend', (e) => {
    if (e.target instanceof Element && !e.target.matches(ASIDE) && e.target.closest(ASIDE)) e.stopPropagation();
  }, true);

  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element) || !e.target.closest(TOGGLE)) return;
    const root = document.documentElement;
    if (root.scrollHeight - innerHeight - scrollY > 2) return;
    root.style.overflowAnchor = 'none';
    const end = performance.now() + SLIDE;
    const pin = () => {
      scrollTo(0, root.scrollHeight);
      if (performance.now() < end) requestAnimationFrame(pin);
      else root.style.overflowAnchor = '';
    };
    requestAnimationFrame(pin);
  }, true);
}
