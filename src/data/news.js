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
    id: 'apm-auto-v1.0.1',
    type: 'release',
    title: 'APM Auto — autonomy through subagent dispatch',
    url: 'https://github.com/sdi2200262/apm-auto',
    date: '2026-04-11',
    description:
      'A custom APM adaptation for Claude Code. The Manager autonomously spawns ephemeral subagents to execute Tasks, only pausing for genuine human judgment — vibe-coding with structure.',
  },
];

export default NEWS;
