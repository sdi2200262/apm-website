import React from 'react';
import Home from '@theme-original/DocBreadcrumbs/Items/Home';
import Link from '@docusaurus/Link';
import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';

// In the research readers the first breadcrumb leads to the Research page, not the site root: Research › Thesis › page.
export default function HomeWrapper() {
  if (useActivePlugin()?.pluginId !== 'research') return <Home />;
  return <li className="breadcrumbs__item"><Link className="breadcrumbs__link" to="/research">Research</Link></li>;
}
