export const GITHUB_URL = 'https://github.com/sdi2200262/agentic-project-management';
export const GITHUB_RELEASES_URL = 'https://github.com/sdi2200262/agentic-project-management/releases';
export const GITHUB_ISSUES_URL = 'https://github.com/sdi2200262/agentic-project-management/issues';
export const GITHUB_DISCUSSIONS_URL = 'https://github.com/sdi2200262/agentic-project-management/discussions';
export const GITHUB_CHANGELOG_URL = 'https://github.com/sdi2200262/agentic-project-management/blob/main/CHANGELOG.md';
export const GITHUB_LICENSE_URL = 'https://github.com/sdi2200262/agentic-project-management/blob/main/LICENSE';
export const NPM_URL = 'https://www.npmjs.com/package/agentic-pm';
export const COPY_FEEDBACK_DURATION = 2000;

export const ASSISTANTS = [
  {
    id: 'cursor',
    name: 'Cursor',
    flag: '-a cursor',
    logo: '/img/cursor-logo.svg',
  },
  {
    id: 'copilot',
    name: 'Copilot',
    flag: '-a copilot',
    logo: '/img/github-copilot-logo.svg',
  },
  {
    id: 'claude',
    name: 'Claude Code',
    flag: '-a claude',
    logo: '/img/claude-logo.svg',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    flag: '-a gemini',
    logo: '/img/gemini-logo.svg',
  },
  {
    id: 'opencode',
    name: 'opencode',
    flag: '-a opencode',
    logo: '/img/opencode-logo-dark.svg',
    logoDark: '/img/opencode-logo-dark.svg',
    logoLight: '/img/opencode-logo-light.svg',
  },
];

/**
 * Grid region map for the landing page.
 * Each region: { id, r1, c1, r2, c2 }
 * Rows and columns are 0-indexed.
 *
 * Layout: 38 rows × 44px each ≈ 1672px total
 * Hero section (rows 0–20) ≈ 880px → fills ~100vh before How It Works
 * How It Works (rows 21+) requires scroll
 */
export const LANDING_REGIONS = [
  // Header bar — full width
  { id: 'hdr',    r1: 0,  c1: 0,  r2: 0,  c2: 23 },

  // Hero heading — matches command block column span
  { id: 'hero-h',    r1: 3, c1: 7, r2: 5, c2: 16 },
  // Hero subtitle
  { id: 'hero-sub',  r1: 6, c1: 7, r2: 6, c2: 16 },
  // Hero stats (stars + downloads)
  { id: 'hero-stats', r1: 7, c1: 7, r2: 7, c2: 16 },

  // Step 1 label
  { id: 'step1',  r1: 9,  c1: 7,  r2: 9,  c2: 16 },
  // Command 1
  { id: 'cmd1',   r1: 10, c1: 7,  r2: 10, c2: 16 },
  // Step 2 label
  { id: 'step2',  r1: 11, c1: 7,  r2: 11, c2: 16 },
  // Command 2
  { id: 'cmd2',   r1: 12, c1: 7,  r2: 12, c2: 16 },
  // Assistant selector
  { id: 'ast',    r1: 13, c1: 7,  r2: 13, c2: 16 },

  // How It Works label (row 21)
  { id: 'hw-lbl',   r1: 21, c1: 5,  r2: 21, c2: 18 },
  // Intro paragraph — full width (row 22)
  { id: 'hw-intro', r1: 22, c1: 5,  r2: 22, c2: 18 },
  // row 23: empty gap
  // Prose paragraph 1 — Planning (rows 24-26, left column)
  { id: 'hw-p1',    r1: 24, c1: 5,  r2: 26, c2: 11 },
  // row 27: empty gap
  // Prose paragraph 2 — Implementation (rows 28-30, left column)
  { id: 'hw-p2',    r1: 28, c1: 5,  r2: 30, c2: 11 },
  // Content viewer — spans both prose paragraphs (right column)
  { id: 'vis',      r1: 24, c1: 13, r2: 30, c2: 18 },

  // Contributors
  { id: 'ctr',    r1: 35, c1: 5,  r2: 35, c2: 18 },

  // Footer bar — full width
  { id: 'ftr',    r1: 38, c1: 0,  r2: 38, c2: 23 },
];
