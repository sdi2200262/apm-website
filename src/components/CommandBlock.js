import React, { useState, useCallback } from 'react';
import styles from './CommandBlock.module.css';
import { COPY_FEEDBACK_DURATION } from '../constants';

export default function CommandBlock({ command, prefix = '$' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    });
  }, [command]);

  return (
    <div className={styles.cmd}>
      <span className={styles.prefix}>{prefix}</span>
      <code className={styles.text}>{command}</code>
      <button
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label="Copy command"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}
