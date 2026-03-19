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
      items: ['agent-types', 'agent-orchestration', 'workflow-overview'],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      collapsed: true,
      items: ['prompt-engineering', 'context-engineering'],
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
