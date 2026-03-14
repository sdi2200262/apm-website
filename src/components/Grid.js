import React, { useMemo } from 'react';
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
 */

function Grid({ regions = [], rows = 26, children }) {
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
          cells.push(
            <div
              key={`c-${r}-${c}`}
              className={styles.cell}
              style={{
                gridRow: r + 1,
                gridColumn: c + 1,
              }}
            />
          );
        }
      }
    }
    return cells;
  }, [rows, claimedCells]);

  return (
    <div className={styles.grid} style={{ gridTemplateRows: `repeat(${rows}, minmax(50px, auto))` }}>
      {emptyCells}
      {children}
    </div>
  );
}

/**
 * A merged region within the grid.
 * Spans from (r1,c1) to (r2,c2) inclusive. Grid is 1-indexed in CSS.
 */
function Region({ r1, c1, r2, c2, className, children, style, ...props }) {
  return (
    <div
      className={clsx(styles.region, className)}
      style={{
        gridRow: `${r1 + 1} / ${r2 + 2}`,
        gridColumn: `${c1 + 1} / ${c2 + 2}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Separator row — a row of cells with a stronger bottom border.
 */
function Separator({ row }) {
  const cells = [];
  for (let c = 0; c < 24; c++) {
    cells.push(
      <div
        key={`sep-${row}-${c}`}
        className={styles.separatorCell}
        style={{
          gridRow: row + 1,
          gridColumn: c + 1,
        }}
      />
    );
  }
  return <>{cells}</>;
}

Grid.Region = Region;
Grid.Separator = Separator;

export default Grid;
