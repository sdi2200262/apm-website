import React, { useMemo, useState, useEffect, useRef } from 'react';
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
 * Desktop: 24 columns, Tablet: 16, Mobile: 12
 *
 * Animation: grid lines fade in top-down on load (hero) and on scroll (below fold).
 */

const FOLD_ROW = 20;

function Grid({ regions = [], rows = 26, children }) {
  const [belowRevealed, setBelowRevealed] = useState(false);
  const sentinelRef = useRef(null);

  // Observe when below-fold content enters viewport
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBelowRevealed(true); },
      { threshold: 0 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Build a set of claimed cells from regions
  const claimedCells = useMemo(() => {
    const claimed = new Set();
    regions.forEach(({ r1, c1, r2, c2 }) => {
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          claimed.add(`${r}-${c}`);
        }
      }
    });
    return claimed;
  }, [regions]);

  // Generate empty cells for unclaimed positions
  const emptyCells = useMemo(() => {
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 24; c++) {
        if (!claimedCells.has(`${r}-${c}`)) {
          const isBelow = r > FOLD_ROW;
          const delay = isBelow ? (r - FOLD_ROW) * 0.04 : r * 0.04;
          cells.push(
            <div
              key={`c-${r}-${c}`}
              className={clsx(styles.cell, isBelow ? styles.cellBelow : styles.cellAbove)}
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
  }, [rows, claimedCells]);

  return (
    <div
      className={clsx(styles.grid, belowRevealed && styles.belowRevealed)}
      style={{ gridTemplateRows: `repeat(${rows}, minmax(var(--apm-row-h, 50px), auto))` }}
    >
      {emptyCells}
      {/* Sentinel element at fold row to trigger below-fold animations */}
      <div
        ref={sentinelRef}
        style={{ gridRow: FOLD_ROW + 1, gridColumn: 1, height: 0, width: 0, overflow: 'hidden' }}
      />
      {children}
    </div>
  );
}

/**
 * A merged region within the grid.
 * Spans from (r1,c1) to (r2,c2) inclusive. Grid is 1-indexed in CSS.
 * Content fades in with same top-down timing as grid borders.
 */
function Region({ r1, c1, r2, c2, className, children, style, ...props }) {
  const isBelow = r1 > FOLD_ROW;
  const delay = isBelow ? (r1 - FOLD_ROW) * 0.04 + 0.15 : r1 * 0.04 + 0.15;

  return (
    <div
      className={clsx(styles.region, isBelow ? styles.regionBelow : styles.regionAbove, className)}
      style={{
        gridRow: `${r1 + 1} / ${r2 + 2}`,
        gridColumn: `${c1 + 1} / ${c2 + 2}`,
        animationDelay: `${delay}s`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

Grid.Region = Region;

export default Grid;
