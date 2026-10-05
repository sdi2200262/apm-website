import React from 'react';

// Thin Lucide chevrons-right (stroke 1.75) in currentColor, replacing Docusaurus's thick arrow in the
// sidebar collapse/expand buttons (it rotates this to « for "collapse").
export default function IconArrow(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m6 17 5-5-5-5M13 17l5-5-5-5" />
    </svg>
  );
}
