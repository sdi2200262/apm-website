import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import Mark from './Mark';
import { drawnSeed, pageSeed } from './seed';
import { reduced } from '../browser';


// Header brand: Icon mark + name, linking home. The mark morphs into the cover mark on hover
// (pointer devices) or keyboard focus. `seed` shares the landing cover's draw; without it, the page-load
// seed (src/components/seed.js), set after mount so SSR stays deterministic. Styles: .brand in src/css/custom.css.
// Pointer (not mouse) events: Docusaurus's Link overrides onMouseEnter with its own prefetch handler.
export default function Brand({ seed: given, onClick, className = '', iconOnly = false, size = 24 }) {
  const [own, setOwn] = useState(drawnSeed);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!given) setOwn(pageSeed()); }, [given]);
  const seed = given || own;
  const morph = (on, e) => setOpen(on && !reduced() && (e.type === 'focus' ? e.target.matches(':focus-visible') : window.matchMedia('(any-hover: hover)').matches));
  return (
    <Link to="/" className={`brand ${className}`} aria-label={iconOnly ? 'Home page' : undefined} onClick={onClick} onPointerEnter={(e) => morph(true, e)} onPointerLeave={(e) => morph(false, e)} onFocus={(e) => morph(true, e)} onBlur={(e) => morph(false, e)}>
      {seed ? <Mark seed={seed} size={size} icon open={open} intro /> : <span style={{ width: size, height: size }} />}
      {!iconOnly && <span className="brand-name">Agentic Project Management</span>}
    </Link>
  );
}
