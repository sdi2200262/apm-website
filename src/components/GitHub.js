import React, { useEffect, useState } from 'react';
import { GITHUB_URL } from '../constants';

// "GitHub" link + the repo's star count as plain text ("2.4k"), left out until loaded or if the
// GitHub API refuses. Styles: .gh / .stars in src/css/custom.css.
export default function GitHub({ className = '' }) {
  const [stars, setStars] = useState(null);
  useEffect(() => {
    fetch(GITHUB_URL.replace('github.com', 'api.github.com/repos'))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => Number.isInteger(d?.stargazers_count) && setStars(new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(d.stargazers_count).toLowerCase()))
      .catch(() => {});
  }, []);
  return (
    <span className={`gh ${className}`}>
      <a href={GITHUB_URL}>GitHub</a>
      {stars && (
        <span className="stars" aria-label={`${stars} stars on GitHub`}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>
          {stars}
        </span>
      )}
    </span>
  );
}
