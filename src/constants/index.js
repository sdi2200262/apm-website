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
    id: 'antigravity',
    name: 'Antigravity (CLI & IDE)',
    flag: '-a antigravity',
    logo: '/img/antigravity-logo.svg',
  },
  {
    id: 'opencode',
    name: 'opencode',
    flag: '-a opencode',
    logo: '/img/opencode-logo-dark.svg',
    logoDark: '/img/opencode-logo-dark.svg',
    logoLight: '/img/opencode-logo-light.svg',
  },
  {
    id: 'codex',
    name: 'Codex',
    flag: '-a codex',
    logo: '/img/codex-logo-dark.svg',
    logoDark: '/img/codex-logo-dark.svg',
    logoLight: '/img/codex-logo-light.svg',
    logoSize: 22,
  },
];

/**
 * Grid region maps for the landing page — one per breakpoint.
 * Each region: { id, r1, c1, r2, c2 }
 * Rows and columns are 0-indexed.
 *
 * Desktop: 24 cols, 39 rows
 * Tablet:  16 cols, 39 rows (How It Works stacked, no assistant selector)
 * Mobile:   8 cols, 39 rows (commands replaced by assistant grid)
 */

// Desktop — 24 columns
export const LANDING_REGIONS = [
  { id: 'hdr',        r1: 0,  c1: 0,  r2: 0,  c2: 23 },
  { id: 'hero-h',     r1: 3,  c1: 7,  r2: 5,  c2: 16 },
  { id: 'hero-sub',   r1: 6,  c1: 7,  r2: 6,  c2: 16 },
  { id: 'hero-stats', r1: 7,  c1: 7,  r2: 7,  c2: 16 },
  { id: 'step1',      r1: 9,  c1: 7,  r2: 9,  c2: 16 },
  { id: 'cmd1',       r1: 10, c1: 7,  r2: 10, c2: 16 },
  { id: 'step2',      r1: 11, c1: 7,  r2: 11, c2: 16 },
  { id: 'cmd2',       r1: 12, c1: 7,  r2: 12, c2: 16 },
  { id: 'ast',        r1: 13, c1: 7,  r2: 13, c2: 16 },
  { id: 'hw-lbl',     r1: 21, c1: 5,  r2: 21, c2: 18 },
  { id: 'hw-intro',   r1: 22, c1: 5,  r2: 22, c2: 18 },
  { id: 'hw-p1',      r1: 24, c1: 5,  r2: 26, c2: 11 },
  { id: 'hw-p2',      r1: 28, c1: 5,  r2: 30, c2: 11 },
  { id: 'vis',        r1: 24, c1: 13, r2: 30, c2: 18 },
  // CTA after How It Works
  { id: 'cta',        r1: 32, c1: 5,  r2: 32, c2: 18 },
  { id: 'ctr',        r1: 35, c1: 5,  r2: 35, c2: 18 },
  { id: 'ftr',        r1: 42, c1: 0,  r2: 42, c2: 23 },
];

// Tablet — 16 columns, stacked How It Works, supported assistants instead of commands
export const LANDING_REGIONS_TABLET = [
  { id: 'hdr',        r1: 0,  c1: 0,  r2: 0,  c2: 15 },
  { id: 'hero-h',     r1: 3,  c1: 3,  r2: 5,  c2: 12 },
  { id: 'hero-sub',   r1: 6,  c1: 3,  r2: 6,  c2: 12 },
  { id: 'hero-stats', r1: 7,  c1: 3,  r2: 7,  c2: 12 },
  // no steps/commands — mobile-ast replaces them
  { id: 'mobile-ast', r1: 9,  c1: 3,  r2: 12, c2: 12 },
  { id: 'hw-lbl',     r1: 21, c1: 2,  r2: 21, c2: 13 },
  { id: 'hw-intro',   r1: 22, c1: 2,  r2: 22, c2: 13 },
  // row 23: empty gap
  { id: 'hw-p1',      r1: 24, c1: 2,  r2: 26, c2: 13 },
  // row 27: empty gap
  { id: 'hw-p2',      r1: 28, c1: 2,  r2: 30, c2: 13 },
  // row 31: empty gap
  { id: 'vis',        r1: 32, c1: 2,  r2: 35, c2: 13 },
  // row 36: empty gap
  // CTA after How It Works
  { id: 'cta',        r1: 37, c1: 2,  r2: 37, c2: 13 },
  // row 38: empty gap
  { id: 'ctr',        r1: 39, c1: 2,  r2: 39, c2: 13 },
  // row 40: empty gap
  { id: 'ftr',        r1: 41, c1: 0,  r2: 42, c2: 15 },
];

// Mobile — 8 columns, commands replaced by assistant grid
export const LANDING_REGIONS_MOBILE = [
  { id: 'hdr',        r1: 0,  c1: 0,  r2: 0,  c2: 7 },
  { id: 'hero-h',     r1: 2,  c1: 1,  r2: 3,  c2: 6 },
  { id: 'hero-sub',   r1: 4,  c1: 1,  r2: 4,  c2: 6 },
  { id: 'hero-stats', r1: 5,  c1: 1,  r2: 5,  c2: 6 },
  // no steps/commands — mobile-ast replaces them
  { id: 'mobile-ast', r1: 7,  c1: 1,  r2: 10, c2: 6 },
  { id: 'hw-lbl',     r1: 21, c1: 1,  r2: 21, c2: 6 },
  { id: 'hw-intro',   r1: 22, c1: 1,  r2: 23, c2: 6 },
  // row 24: empty gap
  { id: 'hw-p1',      r1: 25, c1: 1,  r2: 27, c2: 6 },
  // row 28: empty gap
  { id: 'hw-p2',      r1: 29, c1: 1,  r2: 31, c2: 6 },
  // row 32: empty gap
  { id: 'vis',        r1: 33, c1: 1,  r2: 36, c2: 6 },
  // row 37: empty gap
  // CTA after How It Works
  { id: 'cta',        r1: 38, c1: 1,  r2: 38, c2: 6 },
  // row 39: empty gap
  { id: 'ctr',        r1: 40, c1: 1,  r2: 40, c2: 6 },
  // row 41: empty gap
  { id: 'ftr',        r1: 42, c1: 0,  r2: 42, c2: 7 },
];

/**
 * Returns the region map for the given column count.
 */
export function getRegionsForCols(cols) {
  if (cols <= 8) return LANDING_REGIONS_MOBILE;
  if (cols <= 16) return LANDING_REGIONS_TABLET;
  return LANDING_REGIONS;
}

/**
 * Looks up a region by id from a regions array.
 */
export function getRegion(regions, id) {
  return regions.find(r => r.id === id);
}
