import React, { useEffect, useRef, useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { rng } from './Mark';
import { pageSeed } from './seed';
import { reduced } from '../browser';


// Bottom-right light/dark switch (styles: "Theme switch" in src/css/custom.css). The selected option
// always sits in the right slot (the one shown when closed) under a hand-drawn marker. On a click the
// slots swap at once and two WAAPI animations hide the jump: the new choice slides from the left slot
// into the right one, the old one fades out in place and back in on the left. The page follows 60ms
// later through a View Transition cross-fade; reduced motion skips the effects.
// `away` (landing: once the cover scrolls away) slides the dock off the right edge. `toTop` adds an up button
// with its own random marker; past 400px of scroll it shows and also counts as away. Either way the dock
// stays while the mouse is in the 160x180 bottom-right corner, tracked from its last position, so scrolling
// with the pointer resting there doesn't hide and re-show it (hover isn't re-evaluated during scroll).
// Renders nothing until mounted: the marker's tilt is random and the theme is only known client-side.
export default function ThemeSwitch({ away: awayProp = false, toTop = false }) {
  const { colorMode, setColorMode } = useColorMode();
  const [sel, setSel] = useState(colorMode);
  useEffect(() => setSel(colorMode), [colorMode]); // follow changes made elsewhere (OS theme, other tab)
  const [jit, setJit] = useState(null); // marker insets/tilt: light selected, dark selected, up button
  useEffect(() => {
    const rnd = rng(pageSeed() ^ 0x85ebca6b); // page-load seed: same markers across navigation
    setJit([0, 1, 2].map(() => ({ l: 1.2 + rnd() * 2.4, t: 4.5 + rnd() * 2.6, r: 1.2 + rnd() * 2.4, b: 4.5 + rnd() * 2.6, a: (rnd() - 0.5) * 3.6 })));
  }, []);
  const icons = useRef({}); // mode -> <button>, for the swap animations
  const [open, setOpen] = useState(false); // touch only: tapping the selected icon opens/closes the pill (no :hover there)
  const [scrolled, setScrolled] = useState(false);
  const [inCorner, setInCorner] = useState(false);
  useEffect(() => {
    const on = (e) => e.pointerType === 'mouse' && setInCorner(e.clientX > window.innerWidth - 160 && e.clientY > window.innerHeight - 180);
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);
  useEffect(() => {
    if (!toTop) return undefined;
    const on = () => setScrolled(window.scrollY > 400);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [toTop]);
  const away = (awayProp || (toTop && scrolled)) && !inCorner;
  if (!jit) return null;

  const choose = (mode) => {
    if (mode === sel) {
      if (matchMedia('(any-hover: none)').matches) setOpen(!open);
      return;
    }
    if (!reduced()) {
      icons.current[mode].animate([{ transform: 'translateX(-38px)' }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.34, 1.45, .55, 1)' });
      icons.current[sel].animate([{ transform: 'translateX(38px)', opacity: 1 }, { transform: 'translateX(38px)', opacity: 0, offset: 0.4 }, { transform: 'none', opacity: 0, offset: 0.4 }, { opacity: 0.45 }], { duration: 500 });
    }
    setSel(mode); // a click flushes before paint, so the animations start from the new slots
    setTimeout(() => setOpen(false), 500); // touch: fold the pill once the swap has played
    setTimeout(() => {
      const go = () => setColorMode(mode);
      if (reduced()) go();
      else document.startViewTransition(() => { go(); return new Promise((r) => setTimeout(r, 90)); });
    }, 60);
  };
  const box = (j, left = 0) => ({ left: left + j.l, top: j.t, width: 38 - j.l - j.r, height: 38 - j.t - j.b, transform: `rotate(${j.a}deg)` });
  const btn = (mode, label, icon) => (
    <button ref={(el) => { icons.current[mode] = el; }} type="button" style={{ left: sel === mode ? 38 : 0 }} onClick={() => choose(mode)} aria-pressed={sel === mode} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
    </button>
  );
  return (
    <>
      <div className={`dock${away ? ' away' : ''}`}>
        {toTop && (
          <button type="button" className={`totop${scrolled ? ' on' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' })} aria-label="Back to top" title="Back to top" tabIndex={scrolled ? 0 : -1}>
            <span className="ind" style={box(jit[2])} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6" /></svg>
          </button>
        )}
        <div className={`pill${open ? ' open' : ''}`} role="group" aria-label="Theme">
          <div className="track">
            <span className="ind" style={box(jit[sel === 'light' ? 0 : 1], 38)} />
            {btn('light', 'Light theme', <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>)}
            {btn('dark', 'Dark theme', <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />)}
          </div>
        </div>
      </div>
    </>
  );
}
