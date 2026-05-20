const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');
const staticDir = path.join(__dirname, '..', 'static');
const siteUrl = 'https://agentic-project-management.dev';

// Reading order matches the docs sidebar and progressive concept building
const DOC_ORDER = [
  { file: 'Introduction.md', slug: '/docs/introduction', desc: 'What APM is, the multi-agent coordination model, and how it solves context window degradation' },
  { file: 'Getting_Started.md', slug: '/docs/getting-started', desc: 'Installing the agentic-pm CLI, initializing a project, and running your first APM session step by step' },
  { file: 'Quick_Reference.md', slug: '/docs/quick-reference', desc: 'All APM slash commands, CLI commands, .apm/ file structure, and workflow steps in one page' },
  { file: 'Agent_Types.md', slug: '/docs/agent-types', desc: 'The three AI agent roles (Planner, Manager, Worker) - their responsibilities, context scopes, and how they interact' },
  { file: 'Agent_Orchestration.md', slug: '/docs/agent-orchestration', desc: 'How agents coordinate through planning documents, file-based Message Bus, Task Prompts, structured Memory, and Handoff' },
  { file: 'Workflow_Overview.md', slug: '/docs/workflow-overview', desc: 'Detailed walkthrough of every procedure in the Planning Phase and Implementation Phase' },
  { file: 'Prompt_Engineering.md', slug: '/docs/prompt-engineering', desc: 'How APM prompt files (commands, guides, skills) are designed and why they are structured the way they are' },
  { file: 'Context_Engineering.md', slug: '/docs/context-engineering', desc: 'Why each agent sees specific information, how context flows between agents, and the compression pipeline' },
  { file: 'CLI_Guide.md', slug: '/docs/cli', desc: 'The agentic-pm CLI - all commands (init, archive, update, custom, add, remove, status), options, directory structure, and metadata schema' },
  { file: 'Troubleshooting_Guide.md', slug: '/docs/troubleshooting-guide', desc: 'Common issues during APM sessions, context recovery procedures, and migrating from APM v0.5.x to v1.0.0' },
  { file: 'Tips_and_Tricks.md', slug: '/docs/tips-and-tricks', desc: 'Recommended AI models per agent role, cost optimization strategies, and workflow efficiency patterns' },
  { file: 'Customization_Guide.md', slug: '/docs/customization-guide', desc: 'Forking the APM repository to create custom templates, the build pipeline, and installing from custom repos' },
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
  // Remove ThemedImage and similar JSX blocks
  return content.replace(/<\w+[\s\S]*?\/>/g, '');
}

function cleanContent(content) {
  return stripJsx(stripImports(stripFrontmatter(content))).trim();
}

// --- llms.txt ---

const coreDocs = DOC_ORDER.slice(0, 8); // Introduction through Context Engineering
const refDocs = DOC_ORDER.slice(8);      // CLI Guide through Security Guide

let llmsTxt = `# Agentic Project Management (APM)

> A structured framework for building complex software projects with AI assistants using coordinated multi-agent workflows. Open source, platform-agnostic, supports Claude Code, Cursor, GitHub Copilot, Antigravity CLI, OpenCode, and Codex.

APM coordinates three AI agent roles (Planner, Manager, Workers) across two phases. The Planning Phase gathers requirements and produces structured planning documents. The Implementation Phase executes work through repeating task cycles where the Manager assigns tasks, Workers execute them, and the user carries messages between agent conversations via a file-based Message Bus. All project state lives in files (.apm/ directory), not in any agent's context window, so nothing is lost when a conversation ends.

There is also an installable apm-assist skill that AI assistants can use to answer questions about APM by reading these docs: ${siteUrl}/docs/introduction#installation--usage

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

