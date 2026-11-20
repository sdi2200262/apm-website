const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');
const staticDir = path.join(__dirname, '..', 'static');
const siteUrl = 'https://agentic-project-management.dev';

// Reading order matches the docs sidebar and progressive concept building
const DOC_ORDER = [
  { file: 'Introduction.md', slug: '/docs/introduction', desc: 'What APM is: context decay and context pressure, and how planning documents, separate agents, and involvement you choose address them' },
  { file: 'Getting_Started.md', slug: '/docs/getting-started', desc: 'Installing the agentic-pm CLI, initialising a project, and running a first APM session step by step' },
  { file: 'Quick_Reference.md', slug: '/docs/quick-reference', desc: 'All APM command skills, CLI commands, .apm/ file structure, and workflow steps in one page' },
  { file: 'Agent_Roles.md', slug: '/docs/agent-roles', desc: 'The three agent roles (Planner, Manager, Workers): their responsibilities, context scopes and continuity' },
  { file: 'Agent_Orchestration.md', slug: '/docs/agent-orchestration', desc: 'How agents coordinate through planning documents, a file-based Message Bus, Task Prompts and dispatch, Memory, and Handoff' },
  { file: 'Workflow_Overview.md', slug: '/docs/workflow-overview', desc: 'Every procedure of the Planning Phase and the Implementation Phase, in order' },
  { file: 'Prompt_Engineering.md', slug: '/docs/prompt-engineering', desc: 'How APM\'s files (skills, guides and session documents) are organised and written, and why' },
  { file: 'Context_Engineering.md', slug: '/docs/context-engineering', desc: 'Why each role sees what it sees, and how context crosses conversations through shared files' },
  { file: 'CLI_Guide.md', slug: '/docs/cli', desc: 'The agentic-pm CLI - all commands (init, archive, update, custom, add, remove, status), options, directory structure, and metadata schema' },
  { file: 'Troubleshooting_Guide.md', slug: '/docs/troubleshooting-guide', desc: 'Common issues in APM sessions, context recovery, and upgrading older installations' },
  { file: 'Customisation_Guide.md', slug: '/docs/customisation-guide', desc: 'Custom repositories: forking APM, the build, what you can change, and sharing custom releases' },
  { file: 'Security_Guide.md', slug: '/docs/security', desc: 'Trust model for APM template bundles, what custom bundles can and cannot do, and mitigation strategies' },
];

function stripFrontmatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) {
      return content.slice(end + 3).replace(/^\s*\n/, '');
    }
  }
  return content;
}

function stripImports(content) {
  return content.replace(/^import\s+.*;\s*\n/gm, '');
}

function stripJsx(content) {
  // Replace diagrams with their alt text, then remove any other self-closing JSX
  return content
    .replace(/<Diagram[\s\S]*?alt="([^"]*)"[\s\S]*?\/>/g, '[Diagram: $1]')
    .replace(/<\w+[\s\S]*?\/>/g, '');
}

function cleanContent(content) {
  return stripJsx(stripImports(stripFrontmatter(content))).trim();
}

// --- llms.txt ---

const coreDocs = DOC_ORDER.slice(0, 8); // Introduction through Context Engineering
const refDocs = DOC_ORDER.slice(8);      // CLI Guide through Security Guide

let llmsTxt = `# Agentic Project Management (APM)

> A spec-driven multi-agent framework for AI-assisted software engineering. Open source, for agents supporting AGENTS.md and .agents/skills/, and for Claude Code.

APM addresses two problems of long LLM conversations: context decay (recall and reasoning weaken as context grows) and context pressure (each call costs more and nears the context window's limit). In the Planning Phase, a Planner works with the user to write two planning documents, the Spec and the Plan, and reviews lasting workspace conventions in AGENTS.md. In the Implementation Phase, a Manager coordinates the work, carrying out Tasks through subagents or handing them to Workers in separate conversations. The workflow is flexible. The agents can carry most of the work, or the user can step in wherever and however they see fit, such as with code reviews, manual testing or writing parts of the code, as productive friction that helps them keep authority over, and understanding of, the software being built. Session state lives in files under .apm/, outside any agent's context window.

The installable apm-assist skill lets AI assistants answer questions about APM from these docs: ${siteUrl}/docs/introduction#installation

The full documentation is available as a single file: ${siteUrl}/llms-full.txt

## Docs

${coreDocs.map(d => `- [${d.file.replace('.md', '').replace(/_/g, ' ')}](${siteUrl}${d.slug}): ${d.desc}`).join('\n')}

## Optional

${refDocs.map(d => `- [${d.file.replace('.md', '').replace(/_/g, ' ')}](${siteUrl}${d.slug}): ${d.desc}`).join('\n')}
`;

fs.writeFileSync(path.join(staticDir, 'llms.txt'), llmsTxt);
console.log(`Generated llms.txt (${DOC_ORDER.length} docs)`);

// --- llms-full.txt ---

const fullSections = DOC_ORDER.map(d => {
  const raw = fs.readFileSync(path.join(docsDir, d.file), 'utf8');
  return cleanContent(raw);
});

const llmsFull = fullSections.join('\n\n---\n\n');
fs.writeFileSync(path.join(staticDir, 'llms-full.txt'), llmsFull);
console.log(`Generated llms-full.txt (${DOC_ORDER.length} docs, ${Math.round(llmsFull.length / 1024)}KB)`);

