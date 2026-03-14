const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'docs');
const outputFile = path.join(__dirname, '..', 'static', 'all-apm-docs.md');

const files = fs.readdirSync(docsDir)
  .filter(f => f.endsWith('.md'))
  .sort();

const sections = files.map(f => fs.readFileSync(path.join(docsDir, f), 'utf8'));
const combined = sections.join('\n\n---\n\n');

fs.writeFileSync(outputFile, combined);
console.log(`Generated all-apm-docs.md from ${files.length} files`);
