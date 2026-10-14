import React from 'react';
import Link from '@docusaurus/Link';
import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';
import Brand from '@site/src/components/Brand';

// Both readers start with Home and their section; sidebar categories supply the remaining path.
export default function HomeWrapper() {
  const research = useActivePlugin()?.pluginId === 'research';
  return <>
    <li className="breadcrumbs__item">
      <Brand className="breadcrumbs__link breadcrumbs__home" iconOnly size={18} />
    </li>
    <li className="breadcrumbs__item">
      <Link className="breadcrumbs__link" to={research ? '/research' : '/docs/introduction'}>{research ? 'Research' : 'Docs'}</Link>
    </li>
  </>;
}
