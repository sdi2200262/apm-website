import React, { useEffect, useState } from 'react';
import styles from './Notice.module.css';

// A dismissible message. Its stable id remembers dismissal across navigation and refreshes.
export default function Notice({ id, label, children }) {
  const [visible, setVisible] = useState(false);
  const key = `apm-notice-${id}`;
  useEffect(() => {
    try { setVisible(localStorage.getItem(key) !== 'dismissed'); }
    catch { setVisible(true); }
  }, [key]);
  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(key, 'dismissed'); } catch {}
  };
  if (!visible) return null;
  return (
    <aside className={styles.notice} aria-label={label}>
      <p role="status">{children}</p>
      <button type="button" onClick={dismiss} aria-label={`Dismiss ${label.toLowerCase()} notice`}>Dismiss</button>
    </aside>
  );
}
