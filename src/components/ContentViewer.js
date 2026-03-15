import React, { useState, useCallback } from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './ContentViewer.module.css';

const SLIDES = [
  {
    id: 'planning',
    label: 'Planning Phase',
    diagramDark: '/img/diagrams/planning-phase-dark.svg',
    diagramLight: '/img/diagrams/planning-phase-light.svg',
  },
  {
    id: 'implementation',
    label: 'Implementation Phase',
    diagramDark: '/img/diagrams/implementation-phase-dark.svg',
    diagramLight: '/img/diagrams/implementation-phase-light.svg',
  },
];

export default function ContentViewer() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const { colorMode } = useColorMode();

  const goTo = useCallback((next) => {
    if (next === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(next);
      setFading(false);
    }, 200);
  }, [current]);

  return (
    <div className={styles.carousel}>
      <div className={styles.content}>
        {SLIDES.map((slide, i) => {
          const src = colorMode === 'dark' ? slide.diagramDark : slide.diagramLight;
          return (
            <img
              key={slide.id}
              src={src}
              alt={slide.label}
              className={`${styles.diagram} ${i === current ? styles.diagramActive : styles.diagramHidden} ${fading ? styles.diagramFading : ''}`}
            />
          );
        })}
      </div>
      <div className={styles.nav}>
        <button
          className={styles.arrow}
          onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Previous"
        >‹</button>
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={s.label}
          />
        ))}
        <button
          className={styles.arrow}
          onClick={() => goTo((current + 1) % SLIDES.length)}
          aria-label="Next"
        >›</button>
      </div>
    </div>
  );
}
