import React from 'react';
import Layout from '@theme-original/Layout';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemeSwitch from '@site/src/components/ThemeSwitch';
import BrowserNotice from '@site/src/components/BrowserNotice';

// Adds the bottom-right theme switch + up button to every page except the landing page, which mounts
// its own (its dock also slides away once the cover scrolls off). Rendered as a Layout child so it sits inside the color mode provider.
export default function LayoutWrapper({ children, ...props }) {
  const isLanding = useLocation().pathname === useBaseUrl('/');
  return (
    <Layout {...props}>
      {children}
      <BrowserNotice />
      {!isLanding && <ThemeSwitch toTop />}
    </Layout>
  );
}
