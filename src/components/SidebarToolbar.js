import React, { useState } from 'react';
import styles from './SidebarToolbar.module.css';
import { COPY_FEEDBACK_DURATION } from '../constants';

export default function SidebarToolbar() {
  const [copied, setCopied] = useState(false);

  const copyAllDocs = async () => {
    try {
      const res = await fetch('/all-apm-docs.md');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
    } catch {}
  };

  const downloadAllDocs = () => {
    const a = document.createElement('a');
    a.href = '/all-apm-docs.md';
    a.download = 'all-apm-docs.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={styles.toolbar}>
      <button className={`${styles.btn} ${copied ? styles.active : ''}`} onClick={copyAllDocs}>
        {copied ? 'Copied!' : 'Copy all docs'}
      </button>
      <button className={styles.btn} onClick={downloadAllDocs}>
        Download all docs
      </button>
    </div>
  );
}
