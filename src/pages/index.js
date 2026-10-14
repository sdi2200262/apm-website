import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useIsBrowser from '@docusaurus/useIsBrowser';
import { useColorMode } from '@docusaurus/theme-common';
import Footer from '@theme/Footer';
import Mark from '../components/Mark';
import Header from '../components/Header';
import { CAPTIONS } from '../captions';
import { Wave, useDraw } from '../components/Drawn';
import { Note, useTerms } from '../components/Terms';
import Code from '../components/Code';
import ThemeSwitch from '../components/ThemeSwitch';
import './index.css';

// Landing page, book style (design: "APM Website Redesign", Gruvbox palette + Literata).
// Three parts: cover, overview, getting started. Layout lives in ./index.css; the book style it shares with
// other book pages, the palette, fonts and the header/footer/switch parts in src/css/custom.css and src/components.
// Everything random (mark, waves) is drawn after mount from one seed, so SSR output stays deterministic.

// The cover text and the overview's captions are mirrored word for word in the APM repo's README; change both together.
// Meta description; the cover renders the same text with definitions on its two terms (see Cover).
const DESCRIPTION = 'APM is an open-source framework for managing ambitious software projects with AI assistants. On long tasks, the LLM behind your agent suffers from context decay and context pressure as its conversation grows. APM counters the first by recording the project\'s intent in planning documents, and the second by splitting the work among agents in separate conversations. Coordination between the agents is mediated by you, making each exchange a chance to review the work and intervene before issues propagate. We call this productive friction.';
// Definitions for the cover's terms: key -> definition (the note shows it without repeating the term).
const DEFS = {
  decay: 'The longer the conversation and the more context accumulates, the less reliably the LLM recalls earlier decisions and instructions, and the less consistently it reasons about them.',
  pressure: 'Every call to the LLM resends the whole conversation; each step costs more than the last and nears the context window\'s limit, where the conversation must be cut or summarised.',
  friction: 'Influential human–computer interaction research places friction carefully at chosen points in an interface, as pauses that invite reflection. APM\'s user-mediated coordination aims to create such pauses, allowing you to keep authority over, and understanding of, the software you build.',
};
const CAPTION = CAPTIONS.overview; // shared with the docs (src/captions.js)
// Overview parts, in figure order (Figure 2..6): key = diagram variant (overview-<key>-<theme>.svg). Captions: src/captions.js.
// A no-break space ties each caption's last two words, so no line ends on a lone word (Safari before 26 ignores text-wrap: pretty).
const PARTS = Object.fromEntries(['planning', 'manager', 'workers', 'user', 'state'].map((k) => [k, CAPTIONS[`overview-${k}`].replace(/ (\S+)$/, '\u00a0$1')]));
// [init flag, name, logo in static/img/assistants]. Logo: one file, or [light, dark]; 'mask' = monochrome, painted in --apm-ink.
const ASSISTANTS = [
  ['claude', 'Claude Code', 'claude.svg'],
  ['codex', 'Codex CLI', ['codex-light.svg', 'codex-dark.svg']],
  ['cursor', 'Cursor', 'cursor.svg'],
  ['copilot', 'GitHub Copilot', 'github-copilot.svg', 'mask'],
  ['antigravity', 'Antigravity', 'antigravity.png'],
  ['opencode', 'OpenCode', ['opencode-light.svg', 'opencode-dark.svg']],
];

// The cover's bottom is above 40% of the viewport: the theme switch slides away.
function useAway() {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const on = () => setAway(document.querySelector('.cover').getBoundingClientRect().bottom < window.innerHeight * 0.4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);
  return away;
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
        An APM session runs in two phases. The {term('planning', 'Planner')} writes three planning documents with you: the Spec, the
        Plan, and the Rules. The {term('manager', 'Manager')} then hands out assignments and {term('workers', 'Workers')} carry them out. Their messages pass
        through {term('user', 'you')}, and the {term('state', 'session\'s state')} lives in shared files outside any conversation. Any agent
        can still offload work to its own subagents for efficiency.
      </p>
      <figure className="plate">
        <div className="plate-images">
          {isBrowser && <picture style={{ opacity: active ? 0 : 1 }}>
            <source media="(any-hover: none)" srcSet={svg('-phone')} />
            <img src={svg()} alt="APM overview: the Planner, the Manager, and Workers, coordinated through the user, with shared files" />
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
      <p className="more">The <Link to="/docs/introduction">documentation</Link> covers the workflow and the framework's design in full. APM v1 has also been evaluated in a comparative study: <Link to="/research">read the research</Link>.</p>
    </div>
  );
}

function Logo({ file, mask }) {
  const src = useBaseUrl('/img/assistants/');
  if (mask) return <span className="logo mask" style={{ maskImage: `url(${src}${file})` }} />;
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
        splitting the work among agents in separate conversations. Coordination between the agents is mediated by you, making each
        exchange a chance to review the work and intervene before issues propagate.
        We call this {term('friction', <em>productive friction</em>)}.
      </p>
      <Note id="cover-note" active={!!active} wave={draw?.note}>{DEFS[last.current]}</Note>
    </div>
  );
}

function GettingStarted() {
  const [pick, setPick] = useState(null);
  return (
    <>
      <div className="steps hover-only">
        <h3>1. Install the CLI</h3>
        <p>APM supports Claude Code, Codex CLI, Cursor, GitHub Copilot, Antigravity, and OpenCode. It installs through <code>agentic-pm</code>, a command-line tool on npm that needs Node.js 18 or later:</p>
        <Code>npm install -g agentic-pm</Code>
        <h3>2. Initialise your project</h3>
        <p>In your project directory, run the command below to install APM's commands, guides, skills, and document templates. Select your assistant when the CLI prompts you, or pass it with <code>-a</code>:</p>
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
        <p>Describe what you want to build or change. The Planner works with you on the planning documents, then directs you to start the Manager in a new conversation. From there, each agent tells you what to run next and where. For the full walkthrough, see <Link to="/docs/getting-started">Getting Started</Link>.</p>
      </div>
      <div className="steps touch-only">
        <p>APM runs inside your AI assistant. A command-line tool, <code>agentic-pm</code>, installs its files into your project directory from your terminal.</p>
        <p>For installation and first steps, see <Link to="/docs/getting-started">Getting Started</Link>.</p>
      </div>
    </>
  );
}

export default function Home() {
  const draw = useDraw();
  const away = useAway();
  return (
    <Layout description={DESCRIPTION} noFooter>
      <div className="landing-page book">
        <Header seed={draw?.seed} home />

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
