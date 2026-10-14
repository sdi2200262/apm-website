const sidebars = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Welcome',
      items: ['introduction', 'getting-started', 'quick-reference'],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: ['agent-roles', 'agent-orchestration', 'workflow-overview'],
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
      items: ['cli-guide', 'troubleshooting-guide', 'customisation-guide', 'security-guide', 'tips-and-tricks'],
    },
  ],
};

export default sidebars;
