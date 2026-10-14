import React, { useEffect, useState } from 'react';
import { supportsThemeChange } from '../browser';
import Notice from './Notice';
import styles from './Notice.module.css';

// HTTP copying and unsupported browser features are separate, independently dismissible issues.
export default function BrowserNotice() {
  const [issues, setIssues] = useState(null);
  useEffect(() => {
    setIssues({
      http: !window.isSecureContext,
      browser: !supportsThemeChange() || !window.CSS?.supports('color', 'color-mix(in srgb, black, white)') ||
        (window.isSecureContext && (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined')),
    });
  }, []);
  if (!issues) return null;
  return (
    <div className={styles.stack}>
      {issues.http && <Notice id="http-copy" label="HTTP copying">Copying is unavailable over HTTP.</Notice>}
      {issues.browser && <Notice id="browser-features" label="Browser compatibility">Some styling or features are unavailable in this browser.</Notice>}
    </div>
  );
}
