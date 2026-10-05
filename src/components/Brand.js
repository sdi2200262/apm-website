import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import Mark from './Mark';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Header brand: Icon mark + name, linking home. The mark morphs into the cover mark on hover
// (pointer devices) or keyboard focus. `seed` shares the landing cover's draw; without it, a fresh
// draw per load (after mount, so SSR stays deterministic). Styles: .brand in src/css/custom.css.
// Pointer (not mouse) events: Docusaurus's Link overrides onMouseEnter with its own prefetch handler.
export default function Brand({ seed: given, onClick, className = '' }) {
  const [own, setOwn] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!given) setOwn(Math.floor(Math.random() * 4294967295) + 1); }, [given]);
  const seed = given || own;
  const morph = (on, e) => setOpen(on && !reduced() && (e.type === 'focus' ? e.target.matches(':focus-visible') : window.matchMedia('(any-hover: hover)').matches));
  return (
    <Link to="/" className={`brand ${className}`} onClick={onClick} onPointerEnter={(e) => morph(true, e)} onPointerLeave={(e) => morph(false, e)} onFocus={(e) => morph(true, e)} onBlur={(e) => morph(false, e)}>
      {seed ? <Mark seed={seed} size={24} icon open={open} intro /> : <span style={{ width: 24 }} />}
      <span className="brand-name">Agentic Project Management</span>
    </Link>
  );
}
