import React, { useState } from 'react';
import styles from './DocToolbar.module.css';
import { COPY_FEEDBACK_DURATION } from '../constants';

export default function DocToolbar() {
  const [copied, setCopied] = useState(null);

  const getPageText = () => {
    const el = document.querySelector('.theme-doc-markdown');
    return el ? el.innerText : '';
  };

  const getPageTitle = () => {
    return document.title.split(' | ')[0].trim();
  };

  const copyPage = async () => {
    try {
      await navigator.clipboard.writeText(getPageText());
      setCopied('page');
      setTimeout(() => setCopied(null), COPY_FEEDBACK_DURATION);
    } catch {}
  };

  const downloadPage = () => {
    const text = getPageText();
    const title = getPageTitle();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        <button className={`${styles.btn} ${copied === 'page' ? styles.active : ''}`} onClick={copyPage}>
          {copied === 'page' ? 'Copied!' : 'Copy page'}
        </button>
        <button className={styles.btn} onClick={downloadPage}>
          Download page
        </button>
      </div>
    </div>
  );
}
