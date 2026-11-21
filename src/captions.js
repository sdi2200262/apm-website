// Every diagram caption, keyed by diagram name (static/img/diagrams/<name>-<theme>.svg). The docs' <Diagram>
// and the landing page both read them here, so a figure reads the same wherever it appears. The overview
// captions are also mirrored in the APM README.
export const CAPTIONS = {
  overview: 'The APM workflow. In the Planning Phase, on the left, you and the Planner turn your goals into planning documents; in the Implementation Phase, on the right, the Manager coordinates the work, through Workers as shown or through its own subagents.',
  // The overview's highlighted parts (landing page, Figures 2-6).
  'overview-planning': 'The Planner gathers context from your workspace and other relevant sources, then works with you to define what the session should achieve. Once you approve its understanding, it writes a Spec for what to build and a Plan for how to build it, each for your review.',
  'overview-manager': 'The Manager sends assignments to its subagents or to Workers in separate conversations, reviews their work, and records the session\'s progress. It also maintains the Spec and Plan as the session progresses. Larger changes need your agreement.',
  'overview-workers': 'Each Worker takes the assignments of one area of the project, completes and validates them, logs the outcome, and reports back. Worker conversations and the Manager\'s communicate through a file-based Message Bus, where you mediate each exchange.',
  'overview-user': 'You decide with the Planner how you take part in implementation and how the work is carried out: the Manager uses subagents for more automation, you mediate coordination with Workers for more control, you take on assignments yourself, or any mix of these. You can change this agreement with the Manager at any time.',
  'overview-state': 'The planning documents hold the session\'s intent, a Tracker holds its progress, and file-based Memory accumulates its history. When an agent\'s context fills, a Handoff moves its role to a fresh conversation that resumes from these files. When the session ends, you can archive it and use its documents as context for the next session\'s Planner.',
  // Core Concepts diagrams.
  'planning-phase': 'The Planning Phase. The Planner gathers context and questions you until you approve its understanding, then writes the Spec and the Plan for your review. A gap at either check sends it back.',
  'implementation-phase': 'The Implementation Phase with Workers in separate conversations. Once you approve its understanding, the Manager writes assignments and keeps the Tracker. You deliver their assignments to the Workers, who execute, log to Memory, and report back. You then deliver the reports to the Manager, who reviews each log and report, assigns newly ready work and, unless you agreed otherwise, asks you before each new Stage.',
  'task-cycle': 'One Worker Task through the cycle. The Task Prompt and the Task Report travel through the Message Bus, while the Task Log is written to Memory and reviewed from there.',
  'stage-progression': 'A project moves through its Stages in order. Within a Stage, Tasks whose dependencies are done can proceed together.',
  'message-bus': 'The Message Bus between the Manager and a Worker. The Manager writes Task Prompts to the Worker\'s Task Bus, and the Worker writes Task Reports to its Report Bus. Each is read when you deliver it with a command.',
  'state-compression': 'From execution detail to session history. Workers record execution detail in Task Logs and the Manager records coordination detail in the Tracker. Stage summaries in Memory preserve outcomes, decisions and open issues; the Index links to them and records lasting findings.',
  'handoff': 'A Handoff. The outgoing agent writes a Handoff Log to Memory and a Handoff Prompt to the Handoff Bus. In a fresh conversation, the incoming agent reads both, with other relevant session state, and continues.',
};
