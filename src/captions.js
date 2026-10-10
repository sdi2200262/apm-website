// Every diagram caption, keyed by diagram name (static/img/diagrams/<name>-<theme>.svg). The docs' <Diagram>
// and the landing page both read them here, so a figure reads the same wherever it appears. The overview
// captions are also mirrored in the APM README.
export const CAPTIONS = {
  overview: 'The APM workflow. In the Planning Phase, on the left, you and the Planner turn your goals into planning documents; in the Implementation Phase, on the right, the Manager and Workers implement them together.',
  // The overview's highlighted parts (landing page, Figures 2-6).
  'overview-planning': 'The Planner explores your codebase and questions you about purpose, requirements, and constraints. Once you approve its understanding, it writes the Spec (what to build), the Plan (how the work is divided), and the Rules (how the work is carried out), each for your review.',
  'overview-manager': 'The Manager hands out assignments with the context each needs, reviews what comes back, keeps track of project state, and keeps memory up to date.',
  'overview-workers': 'Each Worker takes the assignments of one area of the project, completes and validates them, logs the work to memory, and reports back.',
  'overview-user': 'When an assignment is ready, you notify its Worker; when a report comes back, you notify the Manager. Before you pass either on, you can review the work, steer, or intervene. You choose how often this happens through how the work is divided and assigned to Workers.',
  'overview-state': 'The planning documents, a progress tracker, and the project\'s memory sit in shared files. When an agent\'s context fills, you can perform a Handoff to move its role to a fresh conversation that picks up where it left off using these files.',
  // Core Concepts diagrams.
  'planning-phase': 'The Planning Phase. The Planner gathers context and questions you until you approve its understanding, then writes the Spec, the Plan, and the Rules for your review. A gap at either check sends it back.',
  'implementation-phase': 'The Implementation Phase. Once you approve its understanding, the Manager writes assignments and keeps the Tracker. You notify the Workers, who execute, log to Memory, and report back, and you notify the Manager, who reviews each log and report before the next assignment.',
  'task-cycle': 'One Task through the cycle. The Task Prompt and the Task Report travel through the Message Bus, while the Task Log is written to Memory and reviewed from there.',
  'stage-progression': 'A project moves through its Stages in order, each starting once the previous one is complete. Within a Stage, Tasks whose dependencies are done can proceed together.',
  'message-bus': 'The Message Bus between the Manager and a Worker. The Manager writes Task Prompts to the Worker\'s Task Bus, and the Worker writes Task Reports to its Report Bus. Each is read when you deliver it with a command.',
  'state-compression': 'From execution detail to project history. Workers record execution detail in Task Logs and the Manager records coordination detail in the Tracker. Both are condensed into Memory\'s Index as summaries and durable observations.',
  'handoff': 'A Handoff. The outgoing agent writes a Handoff Log to Memory and a Handoff Prompt to the Handoff Bus. In a fresh conversation, the incoming agent reads both, with other relevant project state, and continues.',
};
