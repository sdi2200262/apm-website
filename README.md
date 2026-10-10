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
├── components/    # Mark (logo), Brand, GitHub, ThemeSwitch, DocToolbar, Diagram
├── constants/     # GitHub URL, copy feedback timing
├── css/           # custom.css: palette, fonts, docs styling, shared header/footer/switch
├── pages/         # landing page (index.js + index.css)
└── theme/         # Docusaurus overrides: Navbar/Logo, NavbarItem, Footer, Layout, TOC, Icon/Arrow
docs/              # documentation pages (Markdown/MDX)
diagrams/          # diagram icons (Lucide)
scripts/           # build-diagrams.py (diagrams), build-figures.py (thesis charts), build-llms.js (llms.txt)
static/img/        # assistants/ (logos), diagrams/ and figures/ (generated), favicon, social card
```

Diagrams and charts are built offline from a local checkout of the [thesis](https://github.com/sdi2200262/bsc-apm-thesis) and committed; don't edit the output by hand. Both keep the thesis figure's file name.

- Diagrams: edit `scripts/build-diagrams.py` (the d2 diagrams are read from the thesis), then run `python3 scripts/build-diagrams.py <thesis>` (needs the `drawio` and `d2` CLIs on PATH). Output: `static/img/diagrams/<name>[-<variant>]-<light|dark>.svg`.
- Charts: run `<thesis>/.venv/bin/python scripts/build-figures.py <thesis>`. It runs the thesis's own figure scripts on its local data, restyled for the site. Output: `static/img/figures/<name>-<light|dark>.svg`.

## LLM Access

The site serves `/llms.txt` and `/llms-full.txt` for AI agent consumption. Both are generated at build time from the docs by `scripts/build-llms.js` (runs as `prebuild` and `prestart`).

## Contributing

The v0.5.4 docs had video walkthroughs covering the full workflow. The v1 docs need the same treatment. Video coverage of the Planning Phase, Implementation Phase, Handoff, and session continuation would be a significant contribution. If you're interested, open an issue to discuss scope and format.

## License

[MPL-2.0](https://github.com/sdi2200262/agentic-project-management/blob/main/LICENSE)
