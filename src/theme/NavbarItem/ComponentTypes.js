import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import GitHub from '@site/src/components/GitHub';

// Adds navbar item `type: 'custom-github'` (GitHub link + star count), used in docusaurus.config.js.
export default {
  ...ComponentTypes,
  'custom-github': () => <GitHub className="navbar__item" />,
};
