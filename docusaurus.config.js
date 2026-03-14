// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'APM — Agentic Project Management',
  tagline: 'Let AI agents manage your project structure, tasks, and workflow.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://agentic-project-management.dev',
  baseUrl: '/',

  organizationName: 'sdi2200262',
  projectName: 'apm-website',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap',
      },
    },
  ],

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/sdi2200262/apm-website/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/apm-social-card.png',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: '',
        logo: {
          alt: 'APM Logo',
          src: 'img/apm-logo.svg',
        },
        items: [
          {
            href: 'https://github.com/sdi2200262/agentic-project-management',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'https://www.npmjs.com/package/agentic-pm',
            label: 'NPM',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Introduction', to: '/docs/introduction' },
              { label: 'Getting Started', to: '/docs/getting-started' },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Issues',
                href: 'https://github.com/sdi2200262/agentic-project-management/issues',
              },
              {
                label: 'Discussions',
                href: 'https://github.com/sdi2200262/agentic-project-management/discussions',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Contributing',
                href: 'https://github.com/sdi2200262/agentic-project-management/blob/main/CONTRIBUTING.md',
              },
              {
                label: 'Changelog',
                href: 'https://github.com/sdi2200262/agentic-project-management/blob/main/CHANGELOG.md',
              },
            ],
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'toml'],
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 2,
      },
      mermaid: {
        theme: { light: 'neutral', dark: 'dark' },
      },
    }),
};

export default config;
