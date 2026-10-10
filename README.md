# APM Website

Documentation website for [Agentic Project Management](https://github.com/sdi2200262/agentic-project-management).

## Development

```bash
npm ci           # install from lockfile (deterministic)
npm start        # dev server at localhost:3000
npm run build    # production build
npm run serve    # preview production build
```

Requires Node.js 20+.

**Dependency security:** Dependencies are locked via `package-lock.json`. Always use `npm ci` (which installs exactly what the lockfile specifies) rather than `npm install` (which re-resolves semver ranges and can pull in compromised versions). CI builds should always use `npm ci`.

## Structure

```
src/
├── components/    # Mark (logo), Brand, GitHub, ThemeSwitch, DocToolbar, Diagram, Thesis (reader tables, references)
├── constants/     # GitHub URL, copy feedback timing
├── css/           # custom.css: palette, fonts, docs styling, shared header/footer/switch; research.css: thesis reader
├── pages/         # landing page (index.js + index.css)
└── theme/         # Docusaurus overrides: Navbar/Logo, NavbarItem, Footer, Layout, TOC, DocItem/Layout (TOC column on every page), Icon/Arrow, MDXComponents
docs/              # documentation pages (Markdown/MDX)
research/          # thesis reader pages (generated, see Thesis Reader)
diagrams/          # diagram icons (Lucide)
scripts/           # build-diagrams.py (diagrams), build-figures.py (thesis charts), build-llms.js (llms.txt)
static/img/        # assistants/ (logos), diagrams/ and figures/ (generated), favicon, social card
```

Diagrams and charts are built offline from a local checkout of the [thesis](https://github.com/sdi2200262/bsc-apm-thesis) and committed; don't edit the output by hand. Both keep the thesis figure's file name.

- Diagrams: edit `scripts/build-diagrams.py` (the d2 diagrams are read from the thesis), then run `python3 scripts/build-diagrams.py <thesis>` (needs the `drawio` and `d2` CLIs on PATH). Output: `static/img/diagrams/<name>[-<variant>]-<light|dark>.svg`.
- Charts: run `<thesis>/.venv/bin/python scripts/build-figures.py <thesis>`. It runs the thesis's own figure scripts on its local data, restyled for the site. Output: `static/img/figures/<name>-<light|dark>.svg`.

## Thesis Reader

The research section reads the [thesis](https://github.com/sdi2200262/bsc-apm-thesis) from its rolling `latest` release, which the thesis repo rebuilds on every push to main. `scripts/build-thesis.js` (runs as `prebuild` and `prestart`, needs [pandoc](https://pandoc.org) 3 on PATH) downloads the source and the compiled `thesis.pdf`, `.aux` and `.bbl`, then converts the LaTeX with pandoc and `scripts/thesis.lua` into `research/thesis/` (one MDX page per chapter), `research/thesis.json` and `static/research/thesis.pdf`. All are generated and gitignored. The reader is a second docs instance at `/research` (`sidebarsResearch.js`) that shares the docs theme: tables are Markdown tables, figures use the docs' `Diagram`, and only captions, table notes and references get their own styles (`src/css/research.css`). The conversion stops on any reference, citation, figure or LaTeX command it cannot place, and its numbering is checked against the PDF's.

## LLM Access

The site serves `/llms.txt` and `/llms-full.txt` for AI agent consumption. Both are generated at build time from the docs by `scripts/build-llms.js` (runs as `prebuild` and `prestart`).

## Contributing

The v0.5.4 docs had video walkthroughs covering the full workflow. The v1 docs need the same treatment. Video coverage of the Planning Phase, Implementation Phase, Handoff, and session continuation would be a significant contribution. If you're interested, open an issue to discuss scope and format.

## License

[MPL-2.0](https://github.com/sdi2200262/agentic-project-management/blob/main/LICENSE)
