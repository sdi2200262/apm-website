import React from 'react';
import Layout from '@theme-original/Layout';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemeSwitch from '@site/src/components/ThemeSwitch';

// Adds the bottom-right theme switch (+ up button) to every page except the landing page, which mounts
// its own (it slides away with the cover). Rendered as a Layout child so it sits inside the color mode provider.
export default function LayoutWrapper({ children, ...props }) {
  const isLanding = useLocation().pathname === useBaseUrl('/');
  return (
    <Layout {...props}>
      {children}
      {!isLanding && <ThemeSwitch toTop />}
    </Layout>
  );
}
