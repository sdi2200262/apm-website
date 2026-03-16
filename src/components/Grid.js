import React, { useMemo, useState, useEffect, useRef, createContext, useContext } from 'react';
import clsx from 'clsx';
import styles from './Grid.module.css';

/**
 * Grid-as-Background System
 *
 * The entire landing page IS a CSS grid of small square cells.
 * Content lives in "merged cells" (grid-column/row span) — internal borders disappear.
 * Empty cells retain borders, creating structural texture.
 *
 * Regions are defined as coordinate pairs: { id, r1, c1, r2, c2 }
 * Desktop: 24 columns, Tablet: 16, Mobile: 8
 *
 * Animation: grid lines fade in top-down on load (hero) and on scroll (below fold).
 */

const FOLD_ROW = 20;
const GridContext = createContext(FOLD_ROW);

// Breakpoint-aware column count — exported for use by page components
export function useColumns() {
  const [cols, setCols] = useState(24);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w <= 768 ? 8 : w <= 1024 ? 16 : 24);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cols;
}

function Grid({ regions = [], rows = 26, children }) {
  const [revealedUpTo, setRevealedUpTo] = useState(FOLD_ROW);
  const gridRef = useRef(null);
  const cols = useColumns();

  // Progressive reveal: observe sentinel divs placed every 3 rows below the fold
  useEffect(() => {
    if (!gridRef.current) return;
    const sentinels = gridRef.current.querySelectorAll('[data-sentinel]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const row = parseInt(entry.target.dataset.sentinel, 10);
            setRevealedUpTo((prev) => Math.max(prev, row));
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px' }
    );
    sentinels.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Build a set of claimed cells from regions — capped to current col count
  const claimedCells = useMemo(() => {
    const claimed = new Set();
    regions.forEach(({ r1, c1, r2, c2 }) => {
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= Math.min(c2, cols - 1); c++) {
          claimed.add(`${r}-${c}`);
        }
      }
    });
    return claimed;
  }, [regions, cols]);

  // Generate empty cells for unclaimed positions — only up to current col count
  const emptyCells = useMemo(() => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!claimedCells.has(`${r}-${c}`)) {
          const isBelow = r > FOLD_ROW;
          const waveStart = isBelow ? Math.floor((r - FOLD_ROW) / 3) * 3 + FOLD_ROW + 1 : 0;
          const delay = isBelow ? (r - waveStart) * 0.04 : r * 0.04;
          cells.push(
            <div
              key={`c-${r}-${c}`}
              className={clsx(
                styles.cell,
                isBelow ? styles.cellBelow : styles.cellAbove,
                isBelow && r <= revealedUpTo && styles.cellRevealed,
              )}
              style={{
                gridRow: r + 1,
                gridColumn: c + 1,
                animationDelay: `${delay}s`,
              }}
            />
          );
        }
      }
    }
    return cells;
  }, [rows, cols, claimedCells, revealedUpTo]);

  // Generate sentinel divs every 3 rows below the fold
  const sentinels = useMemo(() => {
    const s = [];
    for (let r = FOLD_ROW + 1; r < rows; r += 3) {
      s.push(
        <div
          key={`sentinel-${r}`}
          data-sentinel={r + 2}
          style={{ gridRow: r + 1, gridColumn: 1, height: 0, width: 0, overflow: 'hidden' }}
        />
      );
    }
    return s;
  }, [rows]);

  return (
    <GridContext.Provider value={revealedUpTo}>
      <div
        ref={gridRef}
        className={styles.grid}
        style={{ gridTemplateRows: `repeat(${rows}, minmax(var(--apm-row-h, 50px), auto))` }}
      >
        {emptyCells}
        {sentinels}
        {children}
      </div>
    </GridContext.Provider>
  );
}

/**
 * A merged region within the grid.
 * Spans from (r1,c1) to (r2,c2) inclusive. Grid is 1-indexed in CSS.
 * Content fades in with same top-down timing as grid borders.
 */
function Region({ r1, c1, r2, c2, className, children, style, id, anchor, ...props }) {
  const revealedUpTo = useContext(GridContext);
  const isBelow = r1 > FOLD_ROW;
  const isRevealed = !isBelow || r1 <= revealedUpTo;
  const waveStart = isBelow ? Math.floor((r1 - FOLD_ROW) / 3) * 3 + FOLD_ROW + 1 : 0;
  const delay = isBelow ? (r1 - waveStart) * 0.04 + 0.15 : r1 * 0.04 + 0.15;

  return (
    <div
      className={clsx(
        styles.region,
        isBelow ? styles.regionBelow : styles.regionAbove,
        isBelow && isRevealed && styles.regionRevealed,
        className,
      )}
      style={{
        gridRow: `${r1 + 1} / ${r2 + 2}`,
        gridColumn: `${c1 + 1} / ${c2 + 2}`,
        animationDelay: `${delay}s`,
        ...style,
      }}
      {...(id ? { 'data-region': id } : {})}
      {...(anchor ? { id: anchor } : {})}
      {...props}
    >
      {children}
    </div>
  );
}

Grid.Region = Region;

export default Grid;
