// Every diagram caption, keyed by diagram name (static/img/diagrams/<name>-<theme>.svg). The docs' <Diagram>
// and the landing page both read them here, so a figure reads the same wherever it appears. The overview
// captions are also mirrored in the APM README.
export const CAPTIONS = {
  overview: 'The APM workflow. In the Planning Phase, on the left, you and the Planner turn your goals into planning documents; in the Implementation Phase, on the right, the Manager and Workers implement them together.',
  // The overview's highlighted parts (landing page, Figures 2-6).
  'overview-planning': 'The Planner explores your codebase and questions you about purpose, requirements and constraints. Once you approve its understanding, it writes the Spec (what to build), the Plan (how the work is divided) and the Rules (how the work is carried out), each for your review.',
  'overview-manager': 'The Manager hands out assignments with the context each needs, reviews what comes back, keeps track of project state and keeps memory up to date.',
  'overview-workers': 'Each Worker takes the assignments of one area of the project, completes and validates them, logs the work to memory and reports back.',
  'overview-user': 'When an assignment is ready, you notify its Worker; when a report comes back, you notify the Manager. Each time, you can review, steer or intervene first.',
  'overview-state': 'The planning documents, a progress tracker and the project\'s memory sit in shared files. When an agent\'s context fills, you can perform a Handoff to move its role to a fresh conversation that picks up where it left off using these files.',
};
