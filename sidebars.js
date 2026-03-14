// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Welcome',
      items: ['introduction', 'getting-started'],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: ['workflow-overview', 'agent-types', 'agent-orchestration'],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      collapsed: true,
      items: ['context-and-prompt-engineering'],
    },
    {
      type: 'category',
      label: 'Reference & Guides',
      collapsed: true,
      items: ['cli', 'troubleshooting-guide', 'token-consumption-tips', 'modifying-apm'],
    },
  ],
};

export default sidebars;
