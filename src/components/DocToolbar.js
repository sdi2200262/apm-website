import React, { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './DocToolbar.module.css';
import { COPY_FEEDBACK_DURATION } from '../constants';

// Doc actions under the table of contents (sticky with it): copy/download this page or all docs.
// "All docs" is static/llms-full.txt, generated before each build by scripts/build-all-docs.js.
export default function DocToolbar() {
  const [copied, setCopied] = useState(null);
  const all = useBaseUrl('/llms-full.txt');
  const pageText = () => document.querySelector('.theme-doc-markdown')?.innerText ?? '';
  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(await text());
      setCopied(key);
      setTimeout(() => setCopied(null), COPY_FEEDBACK_DURATION);
    } catch { /* clipboard blocked */ }
  };
  const download = (href, name) => Object.assign(document.createElement('a'), { href, download: name }).click();
  const downloadPage = () => {
    const url = URL.createObjectURL(new Blob([pageText()], { type: 'text/plain' }));
    download(url, `${document.title.split(' | ')[0].trim()}.txt`);
    URL.revokeObjectURL(url);
  };
  const actions = [
    ['page', 'Copy page', () => copy('page', pageText)],
    ['all', 'Copy all docs', () => copy('all', () => fetch(all).then((r) => r.text()))],
    ['dl-page', 'Download page', downloadPage],
    ['dl-all', 'Download all docs', () => download(all, 'apm-docs.txt')],
  ];
  return (
    <div className={styles.toolbar}>
      {actions.map(([key, label, run]) => (
        <button key={key} type="button" className={styles.btn} onClick={run}>{copied === key ? 'Copied' : label}</button>
      ))}
    </div>
  );
}
