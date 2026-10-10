import React, { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';
import thesis from '@site/research/thesis.json';
import styles from './DocToolbar.module.css';
import { COPY_FEEDBACK_DURATION } from '../constants';
import { copyText } from '../browser';

// Doc actions under the table of contents (sticky with it): copy/download this page or all docs.
// "All docs" is static/llms-full.txt, generated before each build by scripts/build-llms.js. In the thesis reader
// (the research docs instance) the actions are the thesis PDF and its citation, from scripts/build-thesis.js.
export default function DocToolbar() {
  const [copied, setCopied] = useState(null);
  const all = useBaseUrl('/llms-full.txt');
  const pdf = useBaseUrl('/research/thesis.pdf');
  const research = useActivePlugin()?.pluginId === 'research';
  const pageText = () => document.querySelector('.theme-doc-markdown')?.innerText ?? '';
  // Label: Copied / Copy failed. All docs can still be fetching when the write starts (copyText in src/browser.js).
  const copy = (key, text) => {
    copyText(text()).then(() => key, () => `${key}-failed`).then((state) => {
      setCopied(state);
      setTimeout(() => setCopied(null), COPY_FEEDBACK_DURATION);
    });
  };
  const download = (href, name) => Object.assign(document.createElement('a'), { href, download: name }).click();
  const downloadPage = () => {
    const url = URL.createObjectURL(new Blob([pageText()], { type: 'text/plain' }));
    download(url, `${document.title.split(' | ')[0].trim()}.txt`);
    URL.revokeObjectURL(url);
  };
  const actions = research ? [
    ['dl-pdf', 'Download PDF', () => download(pdf, 'apm-thesis.pdf')],
    ['cite', 'Copy citation', () => copy('cite', () => thesis.citation)],
  ] : [
    ['page', 'Copy page', () => copy('page', pageText)],
    ['all', 'Copy all docs', () => copy('all', () => fetch(all).then((r) => r.text()))],
    ['dl-page', 'Download page', downloadPage],
    ['dl-all', 'Download all docs', () => download(all, 'apm-docs.txt')],
  ];
  return (
    <div className={styles.toolbar}>
      {actions.map(([key, label, run]) => (
        <button key={key} type="button" className={styles.btn} onClick={run}>{copied === key ? 'Copied' : copied === `${key}-failed` ? 'Copy failed' : label}</button>
      ))}
    </div>
  );
}
