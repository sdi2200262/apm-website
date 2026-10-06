import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useColorMode } from '@docusaurus/theme-common';
import Footer from '@theme/Footer';
import Mark, { rng } from '../components/Mark';
import Brand from '../components/Brand';
import GitHub from '../components/GitHub';
import ThemeSwitch from '../components/ThemeSwitch';
import './index.css';

// Landing page, book style (design: "APM Website Redesign", Gruvbox palette + Literata).
// Three parts: cover, overview, getting started. Layout lives in ./index.css; palette, fonts and the
// shared header/footer/switch parts in src/css/custom.css and src/components. Everything random
// (mark, waves) is drawn after mount from one seed, so SSR output stays deterministic.

const DESCRIPTION = 'APM is an open-source framework for managing ambitious software projects with AI assistants. Instead of working in a single, increasingly chaotic chat, APM structures your work into a coordinated system where different AI agents handle planning, coordination and execution as a team.';
const CAPTION = 'An APM session. The Planning Phase, on the left, produces the planning documents; the Implementation Phase, on the right, carries them out.';
// Overview parts: key = diagram variant (overview-<key>-<theme>.svg), value = caption. Order = Figure 2..6.
const PARTS = {
  planning: 'The Planner conducts structured project discovery while reading your codebase, then decomposes requirements into three planning documents: a Spec (what to build), a Plan (how work is organised) and Rules (how work is performed).',
  manager: 'The Manager hands out assignments with the context each needs, reviews what comes back, and keeps the Tracker and Memory up to date.',
  workers: 'Each Worker takes the assignments of one area of the project, carries them out, checks them, logs the work to Memory and reports back.',
  user: 'You mediate every exchange between agents by running commands in the right conversation. One command delivers a Task to a Worker; another brings the Worker\'s report back to the Manager.',
  state: 'Project state lives in structured files outside any agent\'s context. When an agent reaches its limits, a Handoff passes its working knowledge to a fresh instance of the same agent.',
};
// [init flag, name, logo in static/img/assistants]. Logo: one file, or [light, dark]; 'mask' = monochrome, painted in --apm-ink.
const ASSISTANTS = [
  ['claude', 'Claude Code', 'claude.svg'],
  ['codex', 'Codex CLI', ['codex-light.svg', 'codex-dark.svg']],
  ['cursor', 'Cursor', 'cursor.svg'],
  ['copilot', 'GitHub Copilot', 'github-copilot.svg', 'mask'],
  ['antigravity', 'Antigravity', 'antigravity.png'],
  ['opencode', 'OpenCode', ['opencode-light.svg', 'opencode-dark.svg']],
];

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
    setDraw({ seed, waves: [wave(rnd), wave(rnd)] });
  }, []);
  return draw;
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

// Landing header: the shared brand (clicking it scrolls to the top here) + Docs and GitHub.
function Header({ seed, scrolled }) {
  const toTop = (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); };
  return (
    <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap strip">
        <Brand seed={seed} onClick={toTop} />
        <nav>
          <Link to="/docs/introduction">Docs</Link>
          <GitHub />
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
  const dir = useBaseUrl('/img/diagrams/overview');
  const svg = (variant = '') => `${dir}${variant}-${colorMode}.svg`; // overview[-<variant>]-<theme>.svg
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
        The {term('planning', 'Planner')} turns your goals into a plan, the {term('manager', 'Manager')} assigns its Tasks,
        and {term('workers', 'Workers')} carry them out. {term('user', 'You')} mediate every exchange between them,
        and the {term('state', 'project state')} lives in files that outlast any one conversation.
      </p>
      <figure className="plate">
        <div className="plate-images">
          {isBrowser && <picture style={{ opacity: active ? 0 : 1 }}>
            <source media="(any-hover: none)" srcSet={svg('-phone')} />
            <img src={svg()} alt="APM overview: the Planner, the Manager and Workers, coordinated through the user, with shared files" />
          </picture>}
          {isBrowser && keys.map((k) => <img key={k} className="hl" src={svg(`-${k}`)} alt="" aria-hidden="true" style={{ opacity: active === k ? 1 : 0 }} />)}
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
  const src = useBaseUrl('/img/assistants/');
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
        </section>

        <Footer />
        <ThemeSwitch away={away} toTop />
      </div>
    </Layout>
  );
}
