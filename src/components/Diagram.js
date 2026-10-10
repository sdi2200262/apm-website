import React, { useEffect, useState } from 'react';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import { CAPTIONS } from '../captions';

// A diagram from scripts/build-diagrams.py: static/img/diagrams/<name>[-phone][-<variant>]-<theme>.svg,
// e.g. the overview with one part highlighted: name="overview" variant="manager".
// Both themes render; CSS ("Diagrams" in src/css/custom.css) shows the one matching data-theme, so it is
// right from the first paint. With `phone`, screens up to 600px wide get the portrait layout; without one,
// they keep the desktop layout at a readable minimum width and scroll it sideways. The caption defaults to
// the shared one in src/captions.js, so a diagram also on the landing page reads the same in both places.
// A corner button shrinks every diagram on the site (and grows them back); the choice is kept per viewer.
// The thesis reader (scripts/thesis.lua) passes `images` instead of `name`: space-separated paths under static/img/
// (diagrams/<name> or figures/<name>), shown side by side; `number` and `id` for "Figure 3.1." and its links; and
// the caption as children.

// Shared size: one setting for all diagrams, remembered in localStorage (read after mount, so SSR stays full size).
const KEY = 'apm-diagrams-compact';
const listeners = new Set();
let compact = false;
function useCompact() {
  const [value, setValue] = useState(false);
  useEffect(() => {
    try { compact = localStorage.getItem(KEY) === '1'; } catch {}
    setValue(compact);
    listeners.add(setValue);
    return () => listeners.delete(setValue);
  }, []);
  // Every diagram on the page resizes, which shifts the page; keep the clicked one's centre where it was
  // on screen for the length of the resize transition (.25s in custom.css).
  const toggle = (e) => {
    const fig = e.currentTarget.closest('figure');
    const centre = () => { const r = fig.getBoundingClientRect(); return r.top + r.height / 2; };
    const at = centre();
    compact = !compact;
    try { localStorage.setItem(KEY, compact ? '1' : '0'); } catch {}
    listeners.forEach((set) => set(compact));
    const end = performance.now() + 350;
    const hold = () => {
      window.scrollBy({ top: centre() - at, behavior: 'instant' }); // instant: the page may set smooth scrolling
      if (performance.now() < end) requestAnimationFrame(hold);
    };
    requestAnimationFrame(hold);
    setTimeout(hold, 400); // final correction, also where frames are throttled
  };
  return [value, toggle];
}

// Lucide minimize-2 / maximize-2.
const ICONS = {
  shrink: 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7',
  grow: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
};

export default function Diagram({ name, variant, alt, phone = false, images = `diagrams/${name}`, id, number, children,
  caption = children || CAPTIONS[variant ? `${name}-${variant}` : name] }) {
  const { withBaseUrl } = useBaseUrlUtils();
  const links = useBrokenLinks();
  if (id) links.collectAnchor(id);
  const v = variant ? `-${variant}` : '';
  const src = (path, theme, layout = '') => withBaseUrl(`/img/${path}${layout}${v}-${theme}.svg`);
  const [small, toggle] = useCompact();
  const label = small ? 'Enlarge diagrams' : 'Shrink diagrams';
  return (
    <figure id={id} className={`diagram${phone ? '' : ' diagram--wide'}${small ? ' diagram--compact' : ''}`}>
      <div className="diagram-images">
        <button type="button" className="diagram-size" onClick={toggle} aria-label={label} title={label}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[small ? 'grow' : 'shrink']} /></svg>
        </button>
        {images.split(' ').flatMap((path) => ['light', 'dark'].map((theme) => (
          <picture key={path + theme} className={`diagram-${theme}`}>
            {phone && <source media="(max-width: 600px)" srcSet={src(path, theme, '-phone')} />}
            <img src={src(path, theme)} alt={alt} />
          </picture>
        )))}
      </div>
      {caption && <figcaption data-number={number}>{caption}</figcaption>}
    </figure>
  );
}
