/**
 * News items shown in the header NewsButton popover.
 *
 * To add an item: prepend a new object to the array (newest first).
 *
 * Schema:
 *   id          unique string — also used to track "last seen" in localStorage
 *   type        'release' | 'other'  — controls the tag color
 *   title       headline shown in the popover
 *   url         where the item links to (opens in a new tab)
 *   date        'YYYY-MM-DD'
 *   description optional 1–2 line blurb
 */
const NEWS = [
  {
    id: 'antigravity-migration',
    type: 'other',
    title: 'Migrating Gemini CLI support to Antigravity',
    url: 'https://github.com/sdi2200262/agentic-project-management/issues/115',
    date: '2026-05-20',
    description:
      'Following Google\'s announcement, APM is transitioning support from Gemini CLI to the new Antigravity platform (CLI and IDE). Support for .antigravity and ANTIGRAVITY.md is now live in main.',
  },
  {
    id: 'apm-semi-v1.0.0',
    type: 'release',
    title: 'APM Semi: build hands-on by claiming any Task at any time',
    url: 'https://github.com/sdi2200262/apm-semi',
    date: '2026-04-26',
    description:
      'A custom APM adaptation for collaborative human-and-agent execution, where the User can claim any Task and the respective Agent stays on standby; answering questions, running validation, and logging on the User\'s behalf. Built for direct ownership over the work that matters.',
  },
  {
    id: 'apm-auto-v1.0.1',
    type: 'release',
    title: 'APM Auto: build faster using subagent-driven execution',
    url: 'https://github.com/sdi2200262/apm-auto',
    date: '2026-04-11',
    description:
      'A custom APM adaptation for Claude Code, where the Manager assigns work autonomously using ephemeral subagents and pauses only when needing human judgement. Built for fast prototyping.',
  },
];

export default NEWS;
