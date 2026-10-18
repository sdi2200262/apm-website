const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Builds the thesis reader from the thesis repo's rolling `latest` release (runs as `prebuild` and `prestart`).
// Downloads the source at that tag and the release's compiled thesis.pdf/.aux/.bbl into .thesis/<commit>/
// (kept until the tag moves), then converts it with pandoc and scripts/thesis.lua into research/thesis/
// (one MDX page per chapter), research/thesis.json (overview page data) and static/research/thesis.pdf.
// All three are generated: don't edit or commit them. Needs pandoc 3 on PATH.
const REPO = 'https://github.com/sdi2200262/bsc-apm-thesis';
const CSL = 'https://raw.githubusercontent.com/citation-style-language/styles/1ccf4696be22ea0b55f83cc9163bde3061fddb0a/ieee.csl';
const root = path.join(__dirname, '..');
const out = path.join(root, 'research', 'thesis');

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

// The argument of \name{...}, or its n-th brace group.
function arg(tex, name, n = 0) {
  let i = tex.indexOf(`\\${name}{`) + name.length + 1;
  for (let g = 0; ; g++) {
    let depth = 0, start = i;
    do { depth += { '{': 1, '}': -1 }[tex[i]] || 0; i += tex[i] === '\\' ? 2 : 1; } while (depth);
    if (g === n) return tex.slice(start + 1, i - 1);
  }
}

// Expands \input and \InputTableRows, dropping comments.
function expand(src, file) {
  const tex = fs.readFileSync(path.join(src, file.endsWith('.tex') ? file : `${file}.tex`), 'utf8').replace(/(?<!\\)%.*/g, '');
  return tex.replace(/\\(?:input|InputTableRows)\{([^}]+)\}/g, (_, f) => expand(src, f));
}

const plain = (tex) => execFileSync('pandoc', ['-f', 'latex', '-t', 'plain', '--wrap=none'], { input: tex }).toString().trim();

async function main() {
  const commit = execFileSync('git', ['ls-remote', REPO, 'refs/tags/latest']).toString().split('\t')[0];
  const src = path.join(root, '.thesis', commit);
  if (!fs.existsSync(path.join(src, 'build'))) {
    fs.rmSync(path.join(root, '.thesis'), { recursive: true, force: true });
    fs.mkdirSync(path.join(src, 'build'), { recursive: true });
    await download(`${REPO}/archive/${commit}.tar.gz`, path.join(src, 'source.tar.gz'));
    execFileSync('tar', ['xzf', 'source.tar.gz', '--strip-components=1'], { cwd: src });
    await download(CSL, path.join(src, 'ieee.csl'));
    // The thesis lists three authors before "et al." (biblatex maxnames=6, minnames=3); the style lists one.
    const csl = path.join(src, 'ieee.csl');
    fs.writeFileSync(csl, fs.readFileSync(csl, 'utf8').replaceAll('et-al-use-first="1"', 'et-al-use-first="3"'));
    for (const f of ['thesis.pdf', 'thesis.aux', 'thesis.bbl']) await download(`${REPO}/releases/download/latest/${f}`, path.join(src, 'build', f));
  }

  // One document for pandoc: the front matter becomes an Acknowledgements chapter, the abbreviations and the
  // bibliography unnumbered chapters, and the appendix environment a plain \appendix marker.
  const master = expand(src, 'thesis.tex');
  const body = master.slice(master.indexOf('\\begin{document}') + 16, master.indexOf('\\end{document}'))
    .replace('\\frontmatter', `\\chapter*{Acknowledgements}\n${arg(master, 'acksEn')}`)
    .replace('\\abbreviations', '\\chapter*{Abbreviations}')
    .replace(/\\endfirsthead[\s\S]*?\\endhead/, '') // the abbreviations' repeated page header
    .replace(/\\begin\{appendix\}|\\appendixstartedtrue|\\phantomsection|\\addcontentsline\{[^}]*\}\{[^}]*\}\{[^}]*\}|\\end\{appendix\}/g,
      (m) => (m === '\\begin{appendix}' ? '\\appendix' : ''))
    .replace(/\\printbibliography(\[[^\]]*\])?/, '\\chapter*{Bibliography}')
    .replace(/\\cmidrule[^{]*\{[^}]*\}/g, ''); // pandoc keeps a partial rule's columns as cell text
  // Pages are overwritten in place, then any page this run did not write is removed: a running dev server
  // never sees the folder disappear.
  const started = Date.now();
  fs.mkdirSync(path.join(out, 'appendices'), { recursive: true });
  execFileSync('pandoc', ['-f', 'latex+raw_tex', '-t', 'commonmark_x', '--lua-filter', path.join(__dirname, 'thesis.lua'), '-o', '/dev/null'], {
    cwd: root, input: body, stdio: ['pipe', 'inherit', 'inherit'],
    env: { ...process.env, THESIS_SRC: src, THESIS_OUT: out, THESIS_CSL: path.join(src, 'ieee.csl') },
  });

  for (const f of fs.readdirSync(out, { recursive: true }).map((f) => path.join(out, f))) {
    if (fs.statSync(f).isFile() && fs.statSync(f).mtimeMs < started) fs.rmSync(f);
  }

  const title = arg(master, 'titleEn');
  const [first, last, initial] = ['authorFirstEn', 'authorLastEn', 'authorFirstAbrEn'].map((m) => arg(master, m));
  const [month, year] = arg(master, 'dateEn').split(' ').map((w) => w[0] + w.slice(1).toLowerCase());
  const institution = 'National and Kapodistrian University of Athens'; // set in apmthesis.cls
  const school = `Department of Informatics and Telecommunications, ${institution}`;
  const record = 'https://pergamos.lib.uoa.gr/uoa/dl/object/5450026'; // the thesis's persistent Pergamos record
  fs.writeFileSync(path.join(root, 'research', 'thesis.json'), JSON.stringify({
    title,
    author: `${first} ${last}`,
    supervisor: arg(master, 'supervisorEn'),
    institution,
    date: `${month} ${year}`,
    record,
    recordPage: 'https://pergamos.lib.uoa.gr/en/item/uoadl:5450026',
    abstract: plain(arg(master, 'abstractEn')).split(/\n\s*\n/),
    citation: `${initial} ${last}, “${title},” BSc thesis, ${school}, Athens, Greece, ${month.length > 4 ? `${month.slice(0, 3)}.` : month} ${year}. [Online]. Available: ${record}`,
    // In the thesis's own references.bib style (biblatex): @thesis with its type, institution and location. Inner
    // braces keep the title's case (IEEE sentence-cases titles) and the institution whole (its "and"s split a list).
    biblatex: `@thesis{${last.toLowerCase()}${year}apm,
    author = {${last}, ${first}},
    title = {{${title}}},
    type = {BSc thesis},
    institution = {{${school}}},
    location = {Athens, Greece},
    month = ${month.slice(0, 3).toLowerCase()},
    year = {${year}},
    url = {${record}},
}`,
    commit,
  }, null, 2));
  fs.mkdirSync(path.join(root, 'static', 'research'), { recursive: true });
  fs.copyFileSync(path.join(src, 'build', 'thesis.pdf'), path.join(root, 'static', 'research', 'thesis.pdf'));
  const pages = fs.readdirSync(out, { recursive: true }).filter((f) => f.endsWith('.mdx'));
  const all = pages.map((f) => fs.readFileSync(path.join(out, f), 'utf8')).join('');
  const count = (re) => (all.match(re) || []).length;
  console.log(`thesis ${commit.slice(0, 7)}: ${pages.length} pages, ${count(/<Table /g)} tables (${all.split('</Table>').filter((t) => /\n1\. .*(\n\d+\. .*)*\n*$/.test(t)).length} with notes), `
    + `${count(/<Diagram /g)} figures, ${count(/^\[\^/gm)} footnotes, ${count(/<Reference /g)} references`);
}

main().catch((e) => { console.error(e); process.exit(1); });
