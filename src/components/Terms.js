import React, { useEffect, useRef, useState } from 'react';
import { NoteWave } from './Drawn';

// Underlined terms that pick what a nearby caption shows (hero definitions, overview parts). A term is
// active while a mouse points at it or it has keyboard focus; on touch screens a tap toggles it, and a tap
// (not a scroll) outside `ref` clears it. Spread props(key) on each term's <button>.
export function useTerms() {
  const [active, setActive] = useState(null);
  const ref = useRef();
  useEffect(() => {
    if (!active) return undefined;
    // click, not pointerdown: a touch that starts a scroll must not clear the term.
    const clear = (e) => { if (!ref.current?.contains(e.target)) setActive(null); };
    document.addEventListener('click', clear);
    return () => document.removeEventListener('click', clear);
  }, [active]);
  const props = (key) => ({
    'aria-pressed': active === key,
    onPointerEnter: (e) => e.pointerType === 'mouse' && setActive(key),
    onPointerLeave: (e) => e.pointerType === 'mouse' && setActive(null),
    onFocus: (e) => e.target.matches(':focus-visible') && setActive(key),
    onBlur: (e) => e.target.matches(':focus-visible') && setActive(null),
    onClick: () => matchMedia('(any-hover: none)').matches && setActive(active === key ? null : key),
  });
  return { active, ref, props };
}

// A term's note: a quiet line under the text, ruled by the page's small drawn wave, shown while `active`.
// It is always rendered, so its space is kept and nothing shifts when it appears.
export function Note({ id, active, wave, children }) {
  return (
    <p id={id} className="note" aria-live="polite" aria-hidden={!active} style={{ opacity: active ? 1 : 0 }}>
      {wave && <NoteWave w={wave} />}
      {children}
    </p>
  );
}
