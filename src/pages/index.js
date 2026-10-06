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

// The cover text and the overview's captions are mirrored word for word in the APM repo's README; change both together.
// Meta description; the cover renders the same text with definitions on its two terms (see Cover).
const DESCRIPTION = 'APM is an open-source framework for managing ambitious software projects with AI assistants. On long tasks, the LLM behind your agent suffers from context decay and context pressure as its conversation grows. APM counters the first by recording the project\'s intent in planning documents, and the second by splitting the work among agents in separate conversations. The agents coordinate through you, so each exchange is a chance to review and intervene. We call this productive friction.';
// Definitions for the cover's terms: key -> definition (the note shows it without repeating the term).
const DEFS = {
  decay: 'The longer the conversation and the more context accumulates, the less reliably the LLM recalls earlier decisions and instructions, and the less consistently it reasons about them.',
  pressure: 'Every call to the LLM resends the whole conversation; each step costs more than the last and nears the context window\'s limit, where the conversation must be cut or summarised.',
  friction: 'Influential human–computer interaction research places friction carefully at chosen points in an interface, as pauses that invite reflection. APM\'s user-mediated coordination aims to create such pauses, allowing you to keep authority over, and understanding of, the software you build.',
};
const CAPTION = 'The APM workflow. In the Planning Phase, on the left, you and the Planner turn your goals into planning documents; in the Implementation Phase, on the right, the Manager and Workers implement them together.';
// Overview parts: key = diagram variant (overview-<key>-<theme>.svg), value = caption. Order = Figure 2..6.
const PARTS = {
  planning: 'The Planner explores your codebase and questions you about purpose, requirements and constraints. Once you approve its understanding, it writes the Spec (what to build), the Plan (how the work is divided) and the Rules (how the work is carried out), each for your review.',
  manager: 'The Manager hands out assignments with the context each needs, reviews what comes back, keeps track of project state and keeps memory up to date.',
  workers: 'Each Worker takes the assignments of one area of the project, completes and validates them, logs the work to memory and reports back.',
  user: 'When an assignment is ready, you notify its Worker; when a report comes back, you notify the Manager. Each time, you can review, steer or intervene first.',
  state: 'The planning documents, a progress tracker and the project\'s memory sit in shared files. When an agent\'s context fills, you can perform a Handoff to move its role to a fresh conversation that picks up where it left off using these files.',
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
// peaks/amp make smaller, calmer ones (the cover note's rule); flip -1 starts with a dip instead of a peak.
// Amp scales all vertical jitter, so a small wave keeps the break's proportions. x0/x1: line start and end.
function wave(rnd, peaks = 7, amp = 1, flip = 1) {
  let x = 18 + rnd() * 6;
  const pts = [[x, 10 + (rnd() - 0.5) * 2 * amp]];
  for (let k = 0; k < peaks; k++) {
    x += 13 + rnd() * 5;
    pts.push([x, 10 + (flip * (k % 2 ? 1 : -1) * (3 + rnd() * 4.5) + (rnd() - 0.5) * 1.5) * amp]);
  }
  pts.push([x + 10 + rnd() * 5, 10 + (rnd() - 0.5) * 3 * amp]);
  const f = (n) => n.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)]];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return { d, w: 1.1 + rnd() * 0.45, tilt: (rnd() - 0.5) * 3, x0: pts[0][0], x1: pts[pts.length - 1][0] };
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

// The small wave above the cover note, cropped to the line itself; thinner than the section breaks.
function NoteWave({ w }) {
  const x = w.x0 - 3, width = w.x1 - w.x0 + 6;
  return (
    <svg className="note-wave" viewBox={`${x} 4 ${width} 12`} width={width} height="12" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <path d={w.d} strokeWidth={w.w * 0.75} transform={`rotate(${w.tilt} ${(w.x0 + w.x1) / 2} 10)`} />
    </svg>
  );
}

// One random seed per load, plus everything derived from it. null during SSR and the first render.
function useDraw() {
  const [draw, setDraw] = useState(null);
  useEffect(() => {
    const seed = Math.floor(Math.random() * 4294967295) + 1;
    const rnd = rng(seed ^ 0x9e3779b9);
    setDraw({ seed, waves: [wave(rnd), wave(rnd)], note: wave(rnd, 5 + Math.floor(rnd() * 2), 0.5, rnd() < 0.5 ? 1 : -1) });
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

// Underlined terms that pick what a nearby caption shows (hero definitions, overview parts). A term is
// active while a mouse points at it or it has keyboard focus; on touch screens a tap toggles it, and a tap
// (not a scroll) outside `ref` clears it. Spread props(key) on each term's <button>.
function useTerms() {
  const [active, setActive] = useState(null);
  const ref = useRef();
  useEffect(() => {
    if (!active) return undefined;
    // click, not pointerdown: a touch that starts a scroll must not clear the term.
    const clear = (e) => { if (!ref.current?.contains(e.target)) setActive(null); };
    document.addEventListener('click', clear);
    return () => document.removeEventListener('click', clear);
  }, [active]);
  const props = (key) => ({
    'aria-pressed': active === key,
    onPointerEnter: (e) => e.pointerType === 'mouse' && setActive(key),
    onPointerLeave: (e) => e.pointerType === 'mouse' && setActive(null),
    onFocus: (e) => e.target.matches(':focus-visible') && setActive(key),
    onBlur: (e) => e.target.matches(':focus-visible') && setActive(null),
    onClick: () => matchMedia('(any-hover: none)').matches && setActive(active === key ? null : key),
  });
  return { active, ref, props };
}

// Stacked diagram variants that cross-fade; the active term (useTerms) picks its variant and caption.
// Touch screens (any-hover: none) get the portrait phone diagrams. Images render only in the browser: the
// theme in their URLs is unknown at build time.
function Overview() {
  const { active, ref: lead, props } = useTerms();
  const { colorMode } = useColorMode();
  const dir = useBaseUrl('/img/diagrams/overview');
  const svg = (variant = '') => `${dir}${variant}-${colorMode}.svg`; // overview[-<variant>]-<theme>.svg
  const isBrowser = useIsBrowser();
  const term = (part, text) => <button type="button" className="term" {...props(part)}>{text}</button>;
  const keys = Object.keys(PARTS);
  return (
    <div>
      <p className="lead" ref={lead}>
        The {term('planning', 'Planner')} writes three planning documents with you: the Spec, the Plan and the Rules.
        The {term('manager', 'Manager')} hands out assignments and {term('workers', 'Workers')} carry them out. Their messages pass
        through {term('user', 'you')}, and the {term('state', 'project state')} lives in shared files outside any conversation. Any agent
        can still offload work to its own subagents for efficiency.
      </p>
      <figure className="plate">
        <div className="plate-images">
          {isBrowser && <picture style={{ opacity: active ? 0 : 1 }}>
            <source media="(any-hover: none)" srcSet={svg('-phone')} />
            <img src={svg()} alt="APM overview: the Planner, the Manager and Workers, coordinated through the user, with shared files" />
          </picture>}
          {isBrowser && keys.map((k) => (
            <picture key={k} style={{ opacity: active === k ? 1 : 0 }}>
              <source media="(any-hover: none)" srcSet={svg(`-phone-${k}`)} />
              <img src={svg(`-${k}`)} alt="" aria-hidden="true" />
            </picture>
          ))}
        </div>
        <figcaption aria-live="polite">
          <em>Figure {active ? keys.indexOf(active) + 2 : 1}.</em> {active ? PARTS[active] : CAPTION}
          {!active && <><span className="hover-only"> Point at an underlined term to see its part.</span><span className="touch-only-inline"> Tap an underlined term to see its part.</span></>}
        </figcaption>
      </figure>
      <p className="small">The <Link to="/docs/introduction">documentation</Link> covers the workflow and the framework's design in full.</p>
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

// Cover text: DESCRIPTION with its two problems and its closing term as italic terms (useTerms). Their
// definitions show in a note line below, which keeps its height when empty (nothing shifts) and keeps
// the last definition while fading out.
function Cover({ draw }) {
  const { active, ref, props } = useTerms();
  const last = useRef('decay');
  if (active) last.current = active;
  const term = (key, text) => <button type="button" className="term" aria-controls="cover-note" {...props(key)}>{text}</button>;
  return (
    <div ref={ref}>
      <p>
        APM is an open-source framework for managing ambitious software projects with AI assistants. On long tasks, the LLM
        behind your agent suffers from {term('decay', <em>context decay</em>)} and {term('pressure', <em>context pressure</em>)} as
        its conversation grows. APM counters the first by recording the project&apos;s intent in planning documents, and the second by
        splitting the work among agents in separate conversations. The agents coordinate through you, so each exchange is a chance to
        review and intervene.
        We call this {term('friction', <em>productive friction</em>)}.
      </p>
      <p id="cover-note" className="cover-note" aria-live="polite" aria-hidden={!active} style={{ opacity: active ? 1 : 0 }}>
        {draw && <NoteWave w={draw.note} />}
        {DEFS[last.current]}
      </p>
    </div>
  );
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
        <p>In your project directory, run the command below. Pick your assistant's flag here, or run interactively and select when the CLI prompts you.</p>
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
        <p>Open your assistant in the project and run:</p>
        <Code>/apm-1-initiate-planner</Code>
        <p>From there, each agent tells you what to run next and where. For the full walkthrough, see <Link to="/docs/getting-started">Getting Started</Link>.</p>
      </div>
      <div className="steps touch-only">
        <p>APM runs inside your AI assistant. A command-line tool, <code>agentic-pm</code>, installs its files into your project directory from your terminal.</p>
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
            <Cover draw={draw} />
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
