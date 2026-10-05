import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useColorMode } from '@docusaurus/theme-common';
import '@fontsource/literata/400.css';
import '@fontsource/literata/400-italic.css';
import '@fontsource/literata/600.css';
import Mark, { rng } from '../components/Mark';
import './index.css';

// Landing page, book style (design: "APM Website Redesign", Gruvbox palette + Literata).
// Three parts: cover, overview, getting started. Palettes and layout live in ./index.css.
// Everything random (mark, waves, switch marker) is drawn after mount from one seed, so SSR
// output stays deterministic and hydration never mismatches.

const REPO = 'https://github.com/sdi2200262/agentic-project-management';
const DESCRIPTION = 'APM is an open-source framework for managing ambitious software projects with AI assistants. Instead of working in a single, increasingly chaotic chat, APM structures your work into a coordinated system where different AI agents handle planning, coordination and execution as a team.';
const CAPTION = 'An APM session. The Planning Phase, on the left, produces the planning documents; the Implementation Phase, on the right, carries them out.';
// Overview parts: key = diagram suffix (book-<theme>-overview-<key>.svg), value = caption. Order = Figure 2..5.
const PARTS = {
  planning: 'The Planner conducts structured project discovery while reading your codebase, then decomposes requirements into three planning documents: a Spec (what to build), a Plan (how work is organised) and Rules (how work is performed).',
  implementation: 'The Manager coordinates execution by assigning Tasks to Workers and reviewing completed work. Each Worker receives a self-contained Task Prompt, executes, validates, logs to Memory and reports back.',
  user: 'You mediate every exchange between agents by running commands in the right conversation. One command delivers a Task to a Worker; another brings the Worker\'s report back to the Manager.',
  state: 'Project state lives in structured files outside any agent\'s context. When an agent reaches its limits, a Handoff passes its working knowledge to a fresh instance of the same agent.',
};
// [init flag, name, logo in static/img]. Logo: one file, or [light, dark]; 'mask' = monochrome, painted in --apm-ink.
const ASSISTANTS = [
  ['claude', 'Claude Code', 'claude-logo.svg'],
  ['codex', 'Codex CLI', ['codex-logo-light.svg', 'codex-logo-dark.svg']],
  ['cursor', 'Cursor', 'cursor-logo.svg'],
  ['copilot', 'GitHub Copilot', 'github-copilot-logo.svg', 'mask'],
  ['antigravity', 'Antigravity', 'antigravity-logo.png'],
  ['opencode', 'OpenCode', ['opencode-logo-light.svg', 'opencode-logo-dark.svg']],
];
const FOOTER = [['Contributing', '/blob/main/CONTRIBUTING.md'], ['Issues', '/issues'], ['Discussions', '/discussions'], ['Changelog', '/blob/main/CHANGELOG.md']];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// A hand-drawn section break: ~7 uneven peaks through a Catmull-Rom spline, slightly tilted.
function wave(rnd) {
  let x = 18 + rnd() * 6;
  const pts = [[x, 10 + (rnd() - 0.5) * 2]];
  for (let k = 0; k < 7; k++) {
    x += 13 + rnd() * 5;
    pts.push([x, 10 + (k % 2 ? 1 : -1) * (3 + rnd() * 4.5) + (rnd() - 0.5) * 1.5]);
  }
  pts.push([x + 10 + rnd() * 5, 10 + (rnd() - 0.5) * 3]);
  const f = (n) => n.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)]];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return { d, w: 1.1 + rnd() * 0.45, tilt: (rnd() - 0.5) * 3 };
}

function Wave({ w }) {
  return (
    <div className="wave" aria-hidden="true">
      {w && (
        <svg viewBox="0 0 140 20" width="140" height="20" fill="none" stroke="currentColor" strokeLinecap="round">
          <path d={w.d} strokeWidth={w.w} transform={`rotate(${w.tilt} 70 10)`} />
        </svg>
      )}
    </div>
  );
}

// One random seed per load, plus everything derived from it. null during SSR and the first render.
function useDraw() {
  const [draw, setDraw] = useState(null);
  useEffect(() => {
    const seed = Math.floor(Math.random() * 4294967295) + 1;
    const rnd = rng(seed ^ 0x9e3779b9);
    const waves = [wave(rnd), wave(rnd)];
    // Switch marker insets/tilt when light / dark is selected.
    const jit = [0, 1].map(() => ({ l: 1.2 + rnd() * 2.4, t: 4.5 + rnd() * 2.6, r: 1.2 + rnd() * 2.4, b: 4.5 + rnd() * 2.6, a: (rnd() - 0.5) * 3.6 }));
    setDraw({ seed, waves, jit });
  }, []);
  return draw;
}

// GitHub star count in short form ("2.4k"); null until loaded or if the request fails.
function useStars() {
  const [stars, setStars] = useState(null);
  useEffect(() => {
    fetch(REPO.replace('github.com', 'api.github.com/repos'))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => Number.isInteger(d?.stargazers_count) && setStars(new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(d.stargazers_count).toLowerCase()))
      .catch(() => {});
  }, []);
  return stars;
}

// scrolled: header rule shows after 4px. away: the cover's bottom is above 40% of the viewport (hides the switch).
function useScroll() {
  const [s, setS] = useState({ scrolled: false, away: false });
  useEffect(() => {
    const on = () => {
      const cover = document.querySelector('.cover');
      const next = { scrolled: window.scrollY > 4, away: !!cover && cover.getBoundingClientRect().bottom < window.innerHeight * 0.4 };
      setS((p) => (p.scrolled === next.scrolled && p.away === next.away ? p : next));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  return s;
}

function Header({ seed, scrolled }) {
  const [open, setOpen] = useState(false);
  const stars = useStars();
  // Morph the icon into the cover mark on hover (pointer devices only) or keyboard focus.
  const morph = (on, e) => setOpen(on && !reduced() && (e.type === 'focus' ? e.target.matches(':focus-visible') : window.matchMedia('(any-hover: hover)').matches));
  const toTop = (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); };
  return (
    <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap strip">
        <a href="#" className="brand" onClick={toTop} onMouseEnter={(e) => morph(true, e)} onMouseLeave={(e) => morph(false, e)} onFocus={(e) => morph(true, e)} onBlur={(e) => morph(false, e)}>
          {seed ? <Mark seed={seed} size={24} icon open={open} intro /> : <span style={{ width: 24 }} />}
          <span className="brand-name">Agentic Project Management</span>
        </a>
        <nav>
          <Link to="/docs/introduction">Docs</Link>
          <span className="gh">
            <a href={REPO}>GitHub</a>
            {stars && (
              <span className="stars" aria-label={`${stars} stars on GitHub`}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>
                {stars}
              </span>
            )}
          </span>
        </nav>
      </div>
    </header>
  );
}

// Stacked diagram variants that cross-fade; a term pointed at or focused picks its variant and caption.
// Touch screens (any-hover: none) get the portrait phone diagram instead, and no highlights (CSS).
// Images render only in the browser: the theme in their URLs is unknown at build time.
function Overview() {
  const [active, setActive] = useState(null);
  const { colorMode } = useColorMode();
  const dir = useBaseUrl(`/img/diagrams/book-${colorMode}-overview`);
  const isBrowser = useIsBrowser();
  const term = (part, text) => (
    <button type="button" className="term" onMouseEnter={() => setActive(part)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(part)} onBlur={() => setActive(null)}>
      {text}
    </button>
  );
  const keys = Object.keys(PARTS);
  return (
    <div>
      <p className="lead">
        APM splits the work between three kinds of agent, each in its own conversation with only the context it needs.
        The {term('planning', 'Planner')} turns your goals into a plan, the {term('implementation', 'Manager')} assigns its Tasks,
        and {term('implementation', 'Workers')} carry them out. {term('user', 'You')} mediate every exchange between them,
        and the {term('state', 'project state')} lives in files that outlast any one conversation.
      </p>
      <figure className="plate">
        <div className="plate-images">
          {isBrowser && <picture style={{ opacity: active ? 0 : 1 }}>
            <source media="(any-hover: none)" srcSet={`${dir}-phone.svg`} />
            <img src={`${dir}.svg`} alt="APM overview: the Planner, the Manager and Workers, coordinated through the user, with shared files" />
          </picture>}
          {isBrowser && keys.map((k) => <img key={k} className="hl" src={`${dir}-${k}.svg`} alt="" aria-hidden="true" style={{ opacity: active === k ? 1 : 0 }} />)}
        </div>
        <figcaption aria-live="polite">
          <em>Figure {active ? keys.indexOf(active) + 2 : 1}.</em> {active ? PARTS[active] : CAPTION}
          {!active && <span className="hover-only"> Point at an underlined term to see its part.</span>}
        </figcaption>
      </figure>
      <p className="small">The <Link to="/docs/introduction">docs</Link> cover the agents, the workflow and the CLI in full.</p>
    </div>
  );
}

// A one-line command with a Copy link: clipboard API, then execCommand, else "Select and copy".
function Code({ children }) {
  const [label, setLabel] = useState('Copy');
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = () => {
    const done = (ok) => {
      setLabel(ok ? 'Copied' : 'Select and copy');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setLabel('Copy'), 1600);
    };
    const legacy = () => {
      const ta = Object.assign(document.createElement('textarea'), { value: children });
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* blocked */ }
      ta.remove();
      done(ok);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(children).then(() => done(true), legacy);
    else legacy();
  };
  return (
    <div className="code">
      <pre>{children}</pre>
      <button type="button" className="copy" onClick={copy}>{label}</button>
    </div>
  );
}

function Logo({ file, mask }) {
  const src = useBaseUrl('/img/');
  if (mask) return <span className="logo mask" style={{ maskImage: `url(${src}${file})`, WebkitMaskImage: `url(${src}${file})` }} />;
  if (Array.isArray(file)) return <><img className="logo only-light" src={src + file[0]} alt="" /><img className="logo only-dark" src={src + file[1]} alt="" /></>;
  return <img className="logo" src={src + file} alt="" />;
}

function GettingStarted() {
  const [pick, setPick] = useState(null);
  return (
    <>
      <div className="steps hover-only">
        <h3>1. Install the CLI</h3>
        <p>APM installs through <code>agentic-pm</code>, a command-line tool on npm that needs Node.js 18 or later.</p>
        <Code>npm install -g agentic-pm</Code>
        <h3>2. Initialise your project</h3>
        <p>In your project directory, run the command below. Pick your assistant here, or when APM asks.</p>
        <div className="pick" role="group" aria-label="AI assistant">
          {ASSISTANTS.map(([id, name, file, mask]) => (
            <button key={id} type="button" aria-pressed={pick === id} onClick={() => setPick(pick === id ? null : id)}>
              <Logo file={file} mask={mask} />
              {name}
            </button>
          ))}
        </div>
        <Code>{pick ? `apm init -a ${pick}` : 'apm init'}</Code>
        <h3>3. Start the Planner</h3>
        <p>Open your AI assistant and run:</p>
        <Code>/apm-1-initiate-planner</Code>
        <p>From there, each agent directs you through the workflow step by step. For the full walkthrough, see <Link to="/docs/getting-started">Getting Started</Link>.</p>
      </div>
      <div className="steps touch-only">
        <p>APM runs inside your AI assistant. A command-line tool, <code>agentic-pm</code>, installs its files into your project from a terminal.</p>
        <p><Link to="/docs/getting-started">Installation and first steps are in the docs.</Link></p>
      </div>
    </>
  );
}

// Bottom-right light/dark switch. The selected option always sits in the right slot (the one shown
// when closed) under the marker. On a click the slots swap at once and two WAAPI animations hide the
// jump: the new choice slides from the left slot into the right one, the old one fades out in place
// and fades back in on the left. The page follows 60ms later through a View Transition (cross-fade,
// see index.css); reduced motion or no API skips the effects.
function ThemeSwitch({ jit, away }) {
  const { colorMode, setColorMode } = useColorMode();
  const [sel, setSel] = useState(colorMode);
  useEffect(() => setSel(colorMode), [colorMode]); // follow changes made elsewhere (OS theme, other tab)
  const icons = useRef({}); // mode -> <button>, for the swap animations
  const [open, setOpen] = useState(false); // touch only: tapping the selected icon opens/closes the pill (no :hover there)
  const choose = (mode) => {
    if (mode === sel) {
      if (matchMedia('(any-hover: none)').matches) setOpen(!open);
      return;
    }
    if (!reduced()) {
      icons.current[mode].animate([{ transform: 'translateX(-38px)' }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.34, 1.45, .55, 1)' });
      icons.current[sel].animate([{ transform: 'translateX(38px)', opacity: 1 }, { transform: 'translateX(38px)', opacity: 0, offset: 0.4 }, { transform: 'none', opacity: 0, offset: 0.4 }, { opacity: 0.45 }], { duration: 500 });
    }
    setSel(mode); // a click flushes before paint, so the animations start from the new slots
    setTimeout(() => {
      const go = () => setColorMode(mode);
      if (!document.startViewTransition || reduced()) go();
      else document.startViewTransition(() => { go(); return new Promise((r) => setTimeout(r, 90)); });
    }, 60);
  };
  const j = jit[sel === 'light' ? 0 : 1];
  const marker = { left: 38 + j.l, top: j.t, width: 38 - j.l - j.r, height: 38 - j.t - j.b, transform: `rotate(${j.a}deg)` };
  const btn = (mode, label, icon) => (
    <button ref={(el) => { icons.current[mode] = el; }} type="button" style={{ left: sel === mode ? 38 : 0 }} onClick={() => choose(mode)} aria-pressed={sel === mode} aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
    </button>
  );
  return (
    <>
      <div className={`dockzone${away ? ' on' : ''}`} aria-hidden="true" />
      <div className={`dock${away ? ' away' : ''}`}>
        <div className={`pill${open ? ' open' : ''}`} role="group" aria-label="Theme">
          <div className="track">
            <span className="ind" style={marker} />
            {btn('light', 'Light theme', <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>)}
            {btn('dark', 'Dark theme', <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />)}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const draw = useDraw();
  const { scrolled, away } = useScroll();
  return (
    <Layout description={DESCRIPTION} noFooter>
      <div className="landing-page">
        <Header seed={draw?.seed} scrolled={scrolled} />

        <section className="cover wrap">
          <div className="cover-body">
            <div>
              <h1>Agentic Project Management</h1>
              <p className="subtitle">A Spec-Driven Multi-Agent Framework for AI-Assisted Software Engineering</p>
            </div>
            <div className="cover-mark">{draw && <Mark seed={draw.seed} size={144} intro />}</div>
            <p>{DESCRIPTION}</p>
          </div>
          <Wave w={draw?.waves[0]} />
        </section>

        <section className="wrap">
          <div className="grid2">
            <h2 className="label">Overview</h2>
            <Overview />
          </div>
          <Wave w={draw?.waves[1]} />
        </section>

        <section className="wrap">
          <div className="grid2">
            <h2 className="label">Getting started</h2>
            <GettingStarted />
          </div>
          <footer className="strip bar">
            <nav>{FOOTER.map(([name, path]) => <a key={name} href={REPO + path}>{name}</a>)}</nav>
            <span>APM is open source under the <a href={`${REPO}/blob/main/LICENSE`}>MPL-2.0</a> licence.</span>
          </footer>
        </section>

        {draw && <ThemeSwitch jit={draw.jit} away={away} />}
      </div>
    </Layout>
  );
}
