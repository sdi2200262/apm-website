import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import Grid from '../components/Grid';
import CommandBlock from '../components/CommandBlock';
import AssistantSelector from '../components/AssistantSelector';
import { useStats } from '../hooks/useStats';
import { useContributors } from '../hooks/useContributors';
import {
  ASSISTANTS,
  LANDING_REGIONS,
  GITHUB_URL,
  GITHUB_RELEASES_URL,
  GITHUB_ISSUES_URL,
  GITHUB_DISCUSSIONS_URL,
  GITHUB_CHANGELOG_URL,
  GITHUB_LICENSE_URL,
  NPM_URL,
} from '../constants';
import styles from './index.module.css';

function fmtNum(n) {
  if (!n) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// Inner component — rendered inside <Layout> so useColorMode has its provider
function HomeContent() {
  const [assistant, setAssistant] = useState(null);
  const { stats } = useStats();
  const { contributors } = useContributors();
  const { colorMode, setColorMode } = useColorMode();

  const initCommand = assistant ? `apm init ${assistant.flag}` : 'apm init';

  // Version labels
  const templateVersion = stats.githubRelease || null;
  const cliVersion = stats.npmVersion ? `v${stats.npmVersion}` : null;

  // Hide Docusaurus navbar — we have our own
  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.display = 'none';
    return () => {
      if (navbar) navbar.style.display = '';
    };
  }, []);

  return (
    <main className={`landing-page ${styles.landing}`}>
      <Grid regions={LANDING_REGIONS} rows={38}>

        {/* ===== HEADER BAR (sticky) ===== */}
        <Grid.Region r1={0} c1={0} r2={0} c2={23} className={styles.bar} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          <div className={styles.barInner}>
            <div className={styles.barLeft}>
              <img src="/img/apm-logo.svg" height="22" alt="APM" className={styles.barLogo} />
            </div>
            <nav className={styles.barNav}>
              <a href="#how-it-works" className={styles.navLink}>How it Works</a>
              <a href="/docs/introduction" className={styles.navLink}>Docs</a>
              <a href={GITHUB_URL} className={styles.navLink} target="_blank" rel="noopener">GitHub</a>
              <a href={NPM_URL} className={styles.navLink} target="_blank" rel="noopener">NPM</a>
            </nav>
            <div className={styles.barRight}>
              {templateVersion && (
                <a href={GITHUB_RELEASES_URL} className={styles.versionBadge} target="_blank" rel="noopener">
                  template {templateVersion}
                </a>
              )}
              {cliVersion && (
                <a href={NPM_URL} className={styles.versionBadge} target="_blank" rel="noopener">
                  cli {cliVersion}
                </a>
              )}
              <button
                className={styles.themeToggle}
                onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}
                title="Toggle theme"
                aria-label="Toggle theme"
              >
                {colorMode === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </Grid.Region>

        {/* ===== HERO HEADING ===== */}
        <Grid.Region r1={3} c1={7} r2={5} c2={16} className={styles.heroHeading}>
          <h1 className={styles.heroTitle}>
            Agentic Project<br />Management
          </h1>
        </Grid.Region>

        {/* ===== HERO SUBTITLE ===== */}
        <Grid.Region r1={6} c1={7} r2={6} c2={16} className={styles.heroSub}>
          <p className={styles.heroSubText}>
            Manage complex projects with a team of AI agents, smoothly and efficiently.
          </p>
        </Grid.Region>

        {/* ===== STATS ROW ===== */}
        <Grid.Region r1={7} c1={7} r2={7} c2={16} className={styles.statsRow}>
          {stats.stars > 0 && (
            <a href={GITHUB_URL} className={styles.statChip} target="_blank" rel="noopener">
              <img
                src={colorMode === 'dark' ? '/img/github-mark-white.svg' : '/img/github-mark-black.svg'}
                alt="GitHub"
                className={styles.statLogo}
                width="14"
                height="14"
              />
              {fmtNum(stats.stars)} stars
            </a>
          )}
          {stats.stars > 0 && stats.downloads > 0 && (
            <span className={styles.statSep}>·</span>
          )}
          {stats.downloads > 0 && (
            <a href={NPM_URL} className={styles.statChip} target="_blank" rel="noopener">
              <img
                src="/img/npm-logo.svg"
                alt="npm"
                className={`${styles.statLogo} ${colorMode === 'dark' ? styles.statLogoInvert : ''}`}
                width="28"
                height="11"
              />
              {fmtNum(stats.downloads)} downloads
            </a>
          )}
        </Grid.Region>

        {/* ===== STEP 1 ===== */}
        <Grid.Region r1={9} c1={7} r2={9} c2={16} className={styles.step}>
          <span className={styles.stepLabel}>1. Install the CLI</span>
        </Grid.Region>

        {/* ===== COMMAND 1 ===== */}
        <Grid.Region r1={10} c1={7} r2={10} c2={16} className={styles.cmdRegion}>
          <CommandBlock command="npm install -g agentic-pm" />
        </Grid.Region>

        {/* ===== STEP 2 ===== */}
        <Grid.Region r1={11} c1={7} r2={11} c2={16} className={styles.step}>
          <span className={styles.stepLabel}>2. Initialize your project</span>
        </Grid.Region>

        {/* ===== COMMAND 2 ===== */}
        <Grid.Region r1={12} c1={7} r2={12} c2={16} className={styles.cmdRegion}>
          <CommandBlock command={initCommand} />
        </Grid.Region>

        {/* ===== ASSISTANT SELECTOR ===== */}
        <Grid.Region r1={13} c1={7} r2={13} c2={16} className={styles.astRegion}>
          <AssistantSelector
            active={assistant}
            onSelect={setAssistant}
          />
        </Grid.Region>

        {/* ===== HOW IT WORKS LABEL ===== */}
        <Grid.Region r1={22} c1={5} r2={22} c2={11} className={styles.hwLabel} id="how-it-works">
          <span className={styles.sectionLabel}>HOW IT WORKS</span>
        </Grid.Region>

        {/* ===== HOW IT WORKS TITLE ===== */}
        <Grid.Region r1={23} c1={5} r2={23} c2={11} className={styles.hwTitle}>
          <h2 className={styles.sectionTitle}>Plan. Assign. Execute.</h2>
        </Grid.Region>

        {/* ===== PLANNING PHASE PROSE ===== */}
        <Grid.Region r1={24} c1={5} r2={26} c2={11} className={styles.prose}>
          <h3 className={styles.proseHeading}>Planning Phase</h3>
          <p className={styles.proseText}>
            You start by running the Planner. It takes you through three iterative question
            rounds — from project vision to technical requirements — then delivers an
            understanding summary for your review. Once approved, it writes the Spec, Plan,
            and Rules, sets up the workspace, and hands off to the Manager.
          </p>
        </Grid.Region>

        {/* ===== IMPLEMENTATION PROSE ===== */}
        <Grid.Region r1={27} c1={5} r2={29} c2={11} className={styles.prose}>
          <h3 className={styles.proseHeading}>Implementation</h3>
          <p className={styles.proseText}>
            The Manager reads the Plan, determines what's ready, and writes Task Prompts for
            Workers. You deliver each with a single command. After a Worker reports back, you
            trigger a check — the Manager reviews and dispatches the next task immediately.
            No idle time between tasks.
          </p>
        </Grid.Region>

        {/* ===== YOUR ROLE PROSE ===== */}
        <Grid.Region r1={30} c1={5} r2={32} c2={11} className={styles.prose}>
          <h3 className={styles.proseHeading}>Your Role</h3>
          <p className={styles.proseText}>
            You trigger every handoff — delivering tasks and collecting reports with a single
            command each. Workers stay scoped to their prompt and report back through the bus.
            The Manager handles all dispatch and sequencing. Context limits are covered by
            built-in handoff between instances.
          </p>
        </Grid.Region>

        {/* ===== VIDEO PLACEHOLDER ===== */}
        <Grid.Region r1={22} c1={13} r2={32} c2={18} className={styles.visual}>
          <div className={styles.videoPh}>
            <div className={styles.videoPhInner}>
              <svg className={styles.playIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" opacity="0.6" />
              </svg>
              <span className={styles.videoPhLabel}>Demo video</span>
              <span className={styles.videoPhSub}>coming soon</span>
            </div>
          </div>
        </Grid.Region>

        {/* ===== CONTRIBUTORS ===== */}
        <Grid.Region r1={34} c1={5} r2={34} c2={18} className={styles.contributors}>
          <div className={styles.ctrInner}>
            <span className={styles.ctrLabel}>CONTRIBUTORS</span>
            <div className={styles.ctrAvatars}>
              {contributors.slice(0, 12).map((c) => (
                <a
                  key={c.login}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={c.login}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <img
                    src={c.avatar}
                    alt={c.login}
                    className={styles.ctrAvatar}
                    width="22"
                    height="22"
                    loading="lazy"
                  />
                </a>
              ))}
              {contributors.length > 12 && (
                <span className={styles.ctrMore}>+{contributors.length - 12}</span>
              )}
            </div>
          </div>
        </Grid.Region>

        {/* ===== FOOTER BAR ===== */}
        <Grid.Region r1={37} c1={0} r2={37} c2={23} className={styles.bar}>
          <div className={styles.barInner}>
            <div className={styles.barLeft}>
              <span className={styles.copyright}>
                {new Date().getFullYear()} APM Contributors · Licensed under{' '}
                <a href={GITHUB_LICENSE_URL} className={styles.licenseLink} target="_blank" rel="noopener">
                  MPL 2.0
                </a>
              </span>
            </div>
            <div className={styles.barRight}>
              <div className={styles.footerNavRow}>
                <a href={GITHUB_ISSUES_URL} className={styles.navLink} target="_blank" rel="noopener">Issues</a>
                <a href={GITHUB_DISCUSSIONS_URL} className={styles.navLink} target="_blank" rel="noopener">Discussions</a>
                <a href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`} className={styles.navLink} target="_blank" rel="noopener">Contributing</a>
                <a href={GITHUB_CHANGELOG_URL} className={styles.navLink} target="_blank" rel="noopener">Changelog</a>
              </div>
            </div>
          </div>
        </Grid.Region>

      </Grid>
    </main>
  );
}

// Outer wrapper — provides Layout (and thus ColorModeProvider) context
export default function Home() {
  return (
    <Layout
      title="Agentic Project Management"
      description="Manage complex projects with a team of AI agents, smoothly and efficiently."
      noFooter
    >
      <HomeContent />
    </Layout>
  );
}
