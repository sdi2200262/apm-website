import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from './AssistantSelector.module.css';
import { ASSISTANTS } from '../constants';

export default function AssistantSelector({ active, onSelect }) {
  const { colorMode } = useColorMode();

  return (
    <div className={styles.selector}>
      {ASSISTANTS.map((ast, i) => {
        const logo = ast.logoDark
          ? (colorMode === 'dark' ? ast.logoDark : ast.logoLight)
          : ast.logo;

        return (
          <button
            key={ast.id}
            className={`${styles.btn} ${active?.id === ast.id ? styles.active : ''}`}
            onClick={() => onSelect(active?.id === ast.id ? null : ast)}
            title={ast.name}
            style={{ animationDelay: `${0.6 + i * 0.12}s` }}
          >
            {logo ? (
              <img src={logo} alt={ast.name} className={styles.logo} style={ast.logoSize ? { width: ast.logoSize, height: ast.logoSize } : undefined} />
            ) : null}
            <span className={styles.name}>{ast.name}</span>
          </button>
        );
      })}
    </div>
  );
}
