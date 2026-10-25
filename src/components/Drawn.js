import React, { useEffect, useState } from 'react';
import { rng } from './Mark';
import { drawnSeed, pageSeed } from './seed';

// Hand-drawn rules for the book pages (landing, Research): section breaks and the small wave over a term's note,
// all derived from the page-load seed. Styles: "Book pages" in src/css/custom.css.

// A hand-drawn section break: ~7 uneven peaks through a Catmull-Rom spline, slightly tilted.
// peaks/amp make smaller, calmer ones (the cover note's rule); flip -1 starts with a dip instead of a peak.
// Amp scales all vertical jitter, so a small wave keeps the break's proportions. x0/x1: line start and end.
function wave(rnd, peaks = 7, amp = 1, flip = 1) {
  let x = 18 + rnd() * 6;
  const pts = [[x, 10 + (rnd() - 0.5) * 2 * amp]];
  for (let k = 0; k < peaks; k++) {
    x += 13 + rnd() * 5;
    pts.push([x, 10 + (flip * (k % 2 ? 1 : -1) * (3 + rnd() * 4.5) + (rnd() - 0.5) * 1.5) * amp]);
  }
  pts.push([x + 10 + rnd() * 5, 10 + (rnd() - 0.5) * 3 * amp]);
  const f = (n) => n.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)]];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return { d, w: 1.1 + rnd() * 0.45, tilt: (rnd() - 0.5) * 3, x0: pts[0][0], x1: pts[pts.length - 1][0] };
}

export function Wave({ w }) {
  return (
    <div className="wave" aria-hidden="true">
      {w && (
        <svg viewBox="0 0 140 20" width="140" height="20" fill="none" stroke="currentColor" strokeLinecap="round">
          <path d={w.d} strokeWidth={w.w} transform={`rotate(${w.tilt} 70 10)`} />
        </svg>
      )}
    </div>
  );
}

// The small wave above the cover note, cropped to the line itself; thinner than the section breaks.
export function NoteWave({ w }) {
  const x = w.x0 - 3, width = w.x1 - w.x0 + 6;
  return (
    <svg className="note-wave" viewBox={`${x} 4 ${width} 12`} width={width} height="12" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <path d={w.d} strokeWidth={w.w * 0.75} transform={`rotate(${w.tilt} ${(w.x0 + w.x1) / 2} 10)`} />
    </svg>
  );
}

// Each page scope and rule index gets its own random stream; navigation keeps shapes, refresh redraws them.
// null during SSR and the hydrating first render.
const drawFrom = (seed, scope) => {
  let ruleSeed = seed ^ 0x9e3779b9;
  for (const char of scope) ruleSeed = Math.imul(ruleSeed ^ char.charCodeAt(0), 16777619);
  const rnd = rng(ruleSeed);
  return {
    seed,
    wave: (index) => wave(rng(ruleSeed + index)),
    note: wave(rnd, 5 + Math.floor(rnd() * 2), 0.5, rnd() < 0.5 ? 1 : -1),
  };
};
export function useDraw(scope) {
  const [seed, setSeed] = useState(drawnSeed);
  useEffect(() => { if (!seed) setSeed(pageSeed()); }, [seed]);
  return seed ? drawFrom(seed, scope) : null;
}
