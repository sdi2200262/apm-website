import React, { useState } from 'react';
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
  const { colorMode } = useColorMode();
  const slide = SLIDES[current];
  const diagram = colorMode === 'dark' ? slide.diagramDark : slide.diagramLight;

  return (
    <div className={styles.carousel}>
      <div className={styles.content}>
        <img src={diagram} alt={slide.label} className={styles.diagram} key={diagram} />
      </div>
      <div className={styles.nav}>
        <button
          className={styles.arrow}
          onClick={() => setCurrent((current - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Previous"
        >‹</button>
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={s.label}
          />
        ))}
        <button
          className={styles.arrow}
          onClick={() => setCurrent((current + 1) % SLIDES.length)}
          aria-label="Next"
        >›</button>
      </div>
    </div>
  );
}
