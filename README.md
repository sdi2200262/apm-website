# APM Website

Documentation website for [Agentic Project Management](https://github.com/sdi2200262/agentic-project-management).

## Stack

- **[Docusaurus](https://docusaurus.io/)** — documentation framework
- **React** — custom landing page
- **Tailwind CSS** — utility styles
- **shadcn/ui** — component primitives

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
├── components/    # shared UI components (Grid, CommandBlock, ContentViewer, etc.)
├── constants/     # URLs, assistant configs, grid region map
├── css/           # global design system (custom.css)
├── hooks/         # data-fetching hooks (useStats, useContributors)
├── pages/         # landing page (custom React)
├── theme/         # swizzled Docusaurus theme overrides
└── utils/         # API fetching, caching, formatting
docs/              # documentation pages (Markdown/MDX)
static/img/        # logos, diagrams, social card
```

## License

[MPL-2.0](https://github.com/sdi2200262/agentic-project-management/blob/main/LICENSE)
