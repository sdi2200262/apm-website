import React from 'react';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';
import { CAPTIONS } from '../captions';

// A diagram from scripts/build-diagrams.py: static/img/diagrams/<name>[-phone]-<theme>.svg.
// Both themes render; CSS ("Diagrams" in src/css/custom.css) shows the one matching data-theme, so it is
// right from the first paint. With `phone`, screens up to 600px wide get the portrait layout; without one,
// they keep the desktop layout at a readable minimum width and scroll it sideways. The caption defaults to
// the shared one in src/captions.js, so a diagram also on the landing page reads the same in both places.
export default function Diagram({ name, alt, phone = false, caption = CAPTIONS[name] }) {
  const { withBaseUrl } = useBaseUrlUtils();
  const src = (theme, variant = '') => withBaseUrl(`/img/diagrams/${name}${variant}-${theme}.svg`);
  return (
    <figure className={`diagram${phone ? '' : ' diagram--wide'}`}>
      <div className="diagram-images">
        {['light', 'dark'].map((theme) => (
          <picture key={theme} className={`diagram-${theme}`}>
            {phone && <source media="(max-width: 600px)" srcSet={src(theme, '-phone')} />}
            <img src={src(theme)} alt={alt} />
          </picture>
        ))}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
