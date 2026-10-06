import React, { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './DocToolbar.module.css';
import { COPY_FEEDBACK_DURATION } from '../constants';

// Doc actions under the table of contents (sticky with it): copy/download this page or all docs.
// "All docs" is static/llms-full.txt, generated before each build by scripts/build-llms.js.
export default function DocToolbar() {
  const [copied, setCopied] = useState(null);
  const all = useBaseUrl('/llms-full.txt');
  const pageText = () => document.querySelector('.theme-doc-markdown')?.innerText ?? '';
  // Clipboard writes must start inside the click: a ClipboardItem takes the text as a promise, so the
  // copy of all docs can still be fetching (Safari drops the gesture after an awaited fetch). Fallbacks:
  // writeText, then execCommand (plain-http LAN addresses have no clipboard API). Label: Copied / Copy failed.
  const copy = async (key, text) => {
    const pending = Promise.resolve(text());
    let ok = true;
    try {
      if (window.ClipboardItem) await navigator.clipboard.write([new ClipboardItem({ 'text/plain': pending.then((t) => new Blob([t], { type: 'text/plain' })) })]);
      else await navigator.clipboard.writeText(await pending);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: await pending.catch(() => '') });
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }
    setCopied(ok ? key : `${key}-failed`);
    setTimeout(() => setCopied(null), COPY_FEEDBACK_DURATION);
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
        <button key={key} type="button" className={styles.btn} onClick={run}>{copied === key ? 'Copied' : copied === `${key}-failed` ? 'Copy failed' : label}</button>
      ))}
    </div>
  );
}
