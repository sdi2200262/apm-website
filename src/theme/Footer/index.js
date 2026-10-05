import React from 'react';

const REPO = 'https://github.com/sdi2200262/agentic-project-management';
const LINKS = [['Contributing', '/blob/main/CONTRIBUTING.md'], ['Issues', '/issues'], ['Discussions', '/discussions'], ['Changelog', '/blob/main/CHANGELOG.md']];

// Site footer (replaces Docusaurus's): the same strip as the landing page footer, links left and
// licence line right; stacked and centred on phones. Styles: .site-footer in src/css/custom.css.
export default function Footer() {
  return (
    <footer className="site-footer">
      <nav>{LINKS.map(([name, path]) => <a key={name} href={REPO + path}>{name}</a>)}</nav>
      <span>APM is open source under the <a href={`${REPO}/blob/main/LICENSE`}>MPL-2.0</a> licence.</span>
    </footer>
  );
}
