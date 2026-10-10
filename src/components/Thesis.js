import React from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';

// Thesis reader parts written by scripts/thesis.lua (registered in src/theme/MDXComponents.js; styles in
// src/css/research.css). Each registers its id, so links to it pass the build's broken-anchor check.

// A numbered table: the first child is the caption paragraph, then the Markdown table and its notes list.
export function Table({ id, number, children }) {
  useBrokenLinks().collectAnchor(id);
  const [caption, ...rest] = React.Children.toArray(children);
  return (
    <figure id={id} className="thesis-table">
      <figcaption data-number={number}>{caption.props.children}</figcaption>
      {rest}
    </figure>
  );
}

// A bibliography entry, numbered as in the thesis.
export function Reference({ id, number, children }) {
  useBrokenLinks().collectAnchor(id);
  return <p id={id} className="thesis-reference" data-number={number}>{children}</p>;
}
