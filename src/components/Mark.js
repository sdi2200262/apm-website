import React, { useEffect, useMemo, useState } from 'react';

// Seeded PRNG (mulberry32): one seed gives the same draw, so the header icon and the cover mark match.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PAINT = ['#E2A52E', '#B4382A', '#6F8596', '#8B5A33', '#1F7A74']; // ochre, red, slate, umber, teal
const POP = 'cubic-bezier(.34, 1.56, .64, 1)'; // scale-in with a small overshoot
const EASE = '.5s cubic-bezier(.4, 0, .2, 1)';

// A 3x3 grid draw. rnd() call order follows the design mock, so a seed draws the same mark as there.
function draw(seed) {
  const rnd = rng(seed);
  const cells = Array.from({ length: 9 }, (_, i) => ({ i, on: rnd() < 0.62, fill: PAINT[Math.floor(rnd() * 5)], j: [rnd(), rnd(), rnd(), rnd()] }));
  for (let k = 0, n = cells.filter((c) => c.on).length; n < 4 && k < 9; k++) if (!cells[k].on) { cells[k].on = true; n++; }
  const lines = [0, 1, 2, 3].map((k) => ({ k, pos: (k % 2 ? 66.667 : 33.333) + (rnd() - 0.5) * 2.2, r: rnd(), tilt: (rnd() - 0.5) * 1.4 }));
  return { cells, lines };
}

// Cell box in % of the mark: inset 1.4-3.6% per side, tilted up to ~0.45deg.
function cellStyle({ i, j }, fill, scale, transition) {
  const l = 1.4 + j[0] * 2.2, t = 1.4 + j[1] * 2.2, r = 1.4 + j[2] * 2.2, b = 1.4 + j[3] * 2.2;
  const tilt = (((j[0] * 7 + j[3] * 5) % 1) - 0.5) * 0.9;
  return {
    position: 'absolute', left: `${(i % 3) * 33.333 + l}%`, top: `${Math.floor(i / 3) * 33.333 + t}%`,
    width: `${33.333 - l - r}%`, height: `${33.333 - t - b}%`, background: fill,
    transform: `rotate(${tilt}deg) scale(${scale})`, transition,
  };
}

function lineStyle({ k, pos, tilt }, w, extra) {
  const at = k < 2
    ? { top: 0, bottom: 0, left: `${pos}%`, width: w, marginLeft: -w / 2 }
    : { left: 0, right: 0, top: `${pos}%`, height: w, marginTop: -w / 2 };
  return { position: 'absolute', background: 'currentColor', transform: `rotate(${tilt}deg)`, ...at, ...extra };
}

// The APM mark. Cover: the random draw. `intro` pops the cells in and fades the lines in, once, on mount.
// `icon`: only the centre cell, in the link teal; `open` morphs the icon into the cover draw of the same seed (header hover).
// Grid lines use currentColor; reduced motion is handled in index.css (.landing-page * { transition: none }).
export default function Mark({ seed, size, icon = false, open = false, intro = false }) {
  const { cells, lines } = useMemo(() => draw(seed), [seed]);
  const [shown, setShown] = useState(!intro);
  useEffect(() => {
    if (!intro) return undefined;
    let id = requestAnimationFrame(() => { id = requestAnimationFrame(() => setShown(true)); });
    return () => cancelAnimationFrame(id);
  }, [intro]);

  const lw = size < 20 ? 1 : size < 60 ? 1.25 : 1.5;
  const thin = icon && !open; // icon weights: 0.6-1.45x, never under 0.8px
  const lineW = (L) => (thin ? Math.max(0.8, lw * (0.6 + L.r * 0.85)) : lw * (0.85 + L.r * 0.35));
  const extras = cells.filter((c) => c.on && c.i !== 4);
  const n = extras.length;

  const boxes = icon
    ? cells.filter((c) => c.on || c.i === 4).map((c) => {
      // Open: extra cells pop in one by one, centre takes its cover paint. Close: reverse, faster;
      // the centre pops back last (the same pop plays as its intro).
      const centre = c.i === 4, k = extras.indexOf(c);
      const vis = shown && (centre ? !open || c.on : open);
      const fill = centre && !(open && c.on) ? 'var(--apm-link)' : c.fill;
      const delay = centre ? (open ? 0 : n * 35) : open ? 70 + k * 65 : (n - 1 - k) * 35;
      const tr = `transform ${open || centre ? `.38s ${POP}` : '.2s cubic-bezier(.4, 0, 1, 1)'} ${delay}ms, background-color .3s ease ${delay}ms`;
      return <div key={c.i} style={cellStyle(c, fill, vis ? 1 : 0, tr)} />;
    })
    : cells.filter((c) => c.on).map((c, k) => (
      <div key={c.i} style={cellStyle(c, c.fill, shown ? 1 : 0, intro ? `transform .38s ${POP} ${150 + k * 70}ms` : undefined)} />
    ));

  const fade = intro ? { opacity: shown ? 1 : 0, transition: 'opacity .45s ease' } : {};
  const lineExtra = icon
    ? { ...fade, transition: ['left', 'top', 'width', 'height', 'margin', 'transform'].map((p) => `${p} ${EASE}`).concat(intro ? 'opacity .45s ease' : []).join(', ') }
    : fade;

  return (
    <div className="mark" role="img" aria-label="APM mark" style={{ position: 'relative', flex: 'none', width: size, height: size }}>
      {boxes}
      {lines.map((L) => <div key={L.k} style={lineStyle(L, lineW(L), lineExtra)} />)}
    </div>
  );
}
