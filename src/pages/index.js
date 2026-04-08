import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import Grid, { useColumns } from '../components/Grid';
import CommandBlock from '../components/CommandBlock';
import AssistantSelector from '../components/AssistantSelector';
import ContentViewer from '../components/ContentViewer';
import { useStats } from '../hooks/useStats';
import { useContributors } from '../hooks/useContributors';
import {
  ASSISTANTS,
  GITHUB_URL,
  GITHUB_RELEASES_URL,
  GITHUB_ISSUES_URL,
  GITHUB_DISCUSSIONS_URL,
  GITHUB_CHANGELOG_URL,
  GITHUB_LICENSE_URL,
  NPM_URL,
  getRegionsForCols,
  getRegion,
} from '../constants';
import { formatNumber } from '../utils/format';
import styles from './index.module.css';

// Shorthand: get region coords by id from current responsive map
function R(regions, id) {
  const r = getRegion(regions, id);
  return r ? { r1: r.r1, c1: r.c1, r2: r.r2, c2: r.c2 } : null;
}

// Inner component — rendered inside <Layout> so useColorMode has its provider
function HomeContent() {
  const [assistant, setAssistant] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { stats } = useStats();
  const { contributors } = useContributors();
  const { colorMode, setColorMode } = useColorMode();
  const cols = useColumns();
  const regions = getRegionsForCols(cols);
  const isMobile = cols <= 8;
  const isDesktop = cols > 16;

  const initCommand = assistant ? `apm init ${assistant.flag}` : 'apm init';

  // Version labels
  const templateVersion = stats.githubRelease || null;
  const cliVersion = stats.npmVersion ? `v${stats.npmVersion}` : null;

  // Animated counter hook — slow count-up that finishes ~3s after load
  function useCounter(target, duration = 4000) {
    const [value, setValue] = useState(0);
    useEffect(() => {
      if (!target) return;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = progress < 0.7 ? progress / 0.7 * 0.85 : 0.85 + (1 - Math.pow(1 - (progress - 0.7) / 0.3, 3)) * 0.15;
        setValue(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      const delay = setTimeout(() => requestAnimationFrame(step), 400);
      return () => clearTimeout(delay);
    }, [target]);
    return value;
  }

  const animStars = useCounter(stats.stars);
  const animDownloads = useCounter(stats.downloads);

  // Typed subtitle effect
  const SUBTITLE = 'Manage complex projects with a team of AI agents smoothly and efficiently.';
  const [typedText, setTypedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let interval;
    const delay = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setTypedText(SUBTITLE.slice(0, i));
        if (i >= SUBTITLE.length) {
          clearInterval(interval);
          setTypingDone(true);
        }
      }, 30);
    }, 600);
    return () => { clearTimeout(delay); clearInterval(interval); };
  }, []);

  // Smooth subtitle height
  const subtitleRef = useRef(null);
  useEffect(() => {
    const el = subtitleRef.current;
    if (!el) return;
    const child = el.firstElementChild;
    if (!child) return;
    el.style.height = `${child.scrollHeight}px`;
  }, [typedText]);

  // Contributor scroll-in observer
  const ctrRef = useRef(null);
  const [ctrVisible, setCtrVisible] = useState(false);

  useEffect(() => {
    if (!ctrRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCtrVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(ctrRef.current);
    return () => observer.disconnect();
  }, []);

  // Theme wipe transition
  const handleThemeToggle = () => {
    const goingLight = colorMode === 'dark';
    setColorMode(goingLight ? 'light' : 'dark');

    const oldBg = getComputedStyle(document.documentElement).getPropertyValue('--apm-bg').trim();
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '10000', background: oldBg,
      pointerEvents: 'none', clipPath: 'inset(0 0 0 0)', transition: 'clip-path 0.35s ease-in-out',
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.clipPath = goingLight ? 'inset(0 0 100% 0)' : 'inset(100% 0 0 0)';
      });
    });
    setTimeout(() => overlay.remove(), 450);
  };

  // Hide Docusaurus navbar — we have our own
  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.display = 'none';
    return () => { if (navbar) navbar.style.display = ''; };
  }, []);

  return (
    <main className={`landing-page ${styles.landing}`}>
      <Grid regions={regions} rows={43}>

        {/* ===== HEADER BAR (sticky) ===== */}
        <Grid.Region {...R(regions, 'hdr')} id="hdr" className={styles.bar} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          <div className={styles.barInner}>
            <div className={styles.barLeft}>
              <img src={colorMode === 'dark' ? '/img/apm-logo-dark.svg' : '/img/apm-logo.svg'} height="22" alt="APM" className={styles.barLogo} />
            </div>
            <nav className={`${styles.barNav} ${menuOpen ? styles.barNavOpen : ''}`}>
              <a href="#how-it-works" className={styles.navLink} onClick={() => setMenuOpen(false)}>How it Works</a>
              <a href="/docs/introduction" className={styles.navLink} onClick={() => setMenuOpen(false)}>Docs</a>
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
              <button className={styles.themeToggle} onClick={handleThemeToggle} title="Toggle theme" aria-label="Toggle theme">
                {colorMode === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
              <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                <span className={`${styles.hamburgerLine} ${menuOpen ? styles.hamburgerOpen : ''}`} />
              </button>
            </div>
          </div>
        </Grid.Region>

        {/* ===== HERO HEADING ===== */}
        <Grid.Region {...R(regions, 'hero-h')} id="hero-h" className={styles.heroHeading}>
          <h1 className={styles.heroTitle}>Agentic Project<br />Management</h1>
        </Grid.Region>

        {/* ===== HERO SUBTITLE ===== */}
        <Grid.Region {...R(regions, 'hero-sub')} id="hero-sub" className={styles.heroSub}>
          <div className={styles.heroSubWrap} ref={subtitleRef}>
            <p className={styles.heroSubText}>
              {typedText}
              <span className={`${styles.typedCursor} ${typingDone ? styles.typedCursorDone : ''}`} />
            </p>
          </div>
        </Grid.Region>

        {/* ===== STATS ROW ===== */}
        <Grid.Region {...R(regions, 'hero-stats')} id="hero-stats" className={styles.statsRow}>
          {stats.stars > 0 && (
            <a href={GITHUB_URL} className={styles.statChip} target="_blank" rel="noopener">
              <img src={colorMode === 'dark' ? '/img/github-mark-white.svg' : '/img/github-mark-black.svg'} alt="GitHub" className={styles.statLogo} width="14" height="14" />
              {formatNumber(animStars)} stars
            </a>
          )}
          {stats.stars > 0 && stats.downloads > 0 && <span className={styles.statSep}>·</span>}
          {stats.downloads > 0 && (
            <a href={NPM_URL} className={styles.statChip} target="_blank" rel="noopener">
              <img src="/img/npm-logo.svg" alt="npm" className={`${styles.statLogo} ${colorMode === 'dark' ? styles.statLogoInvert : ''}`} width="28" height="11" />
              {formatNumber(animDownloads)} downloads
            </a>
          )}
        </Grid.Region>

        {/* ===== STEPS & COMMANDS (desktop only) ===== */}
        {isDesktop && R(regions, 'step1') && (
          <>
            <Grid.Region {...R(regions, 'step1')} id="step1" className={styles.step}>
              <span className={styles.stepLabel}><span className={styles.stepNum}>1.</span> Install the CLI</span>
            </Grid.Region>
            <Grid.Region {...R(regions, 'cmd1')} id="cmd1" className={styles.cmdRegion}>
              <CommandBlock command="npm install -g agentic-pm" />
            </Grid.Region>
            <Grid.Region {...R(regions, 'step2')} id="step2" className={styles.step}>
              <span className={styles.stepLabel}><span className={styles.stepNum}>2.</span> Initialize your project</span>
            </Grid.Region>
            <Grid.Region {...R(regions, 'cmd2')} id="cmd2" className={styles.cmdRegion}>
              <CommandBlock command={initCommand} />
            </Grid.Region>
            <Grid.Region {...R(regions, 'ast')} id="ast" className={styles.astRegion}>
              <AssistantSelector active={assistant} onSelect={setAssistant} />
            </Grid.Region>
          </>
        )}

        {/* ===== SUPPORTED ASSISTANTS (mobile + tablet) ===== */}
        {!isDesktop && R(regions, 'mobile-ast') && (
          <Grid.Region {...R(regions, 'mobile-ast')} id="mobile-ast" className={styles.mobileAst}>
            <span className={styles.mobileAstLabel}>Supported Assistants</span>
            <div className={styles.mobileAstGrid}>
              {ASSISTANTS.map((ast, i) => {
                const logo = ast.logoDark ? (colorMode === 'dark' ? ast.logoDark : ast.logoLight) : ast.logo;
                return (
                  <div key={ast.id} className={styles.mobileAstItem} style={{ animationDelay: `${0.6 + i * 0.12}s` }}>
                    {logo && <img src={logo} alt="" className={styles.mobileAstLogo} style={ast.logoSize ? { width: ast.logoSize, height: ast.logoSize } : undefined} />}
                    <span className={styles.mobileAstName}>{ast.name}</span>
                  </div>
                );
              })}
            </div>
          </Grid.Region>
        )}

        {/* ===== HOW IT WORKS ===== */}
        <Grid.Region {...R(regions, 'hw-lbl')} id="hw-lbl" anchor="how-it-works" className={styles.hwLabel}>
          <span className={styles.sectionLabel}>HOW IT WORKS</span>
        </Grid.Region>

        <Grid.Region {...R(regions, 'hw-intro')} id="hw-intro" className={styles.prose}>
          <p className={styles.proseText}>
            An <strong>APM session</strong> runs across two phases. A Planner, a Manager, and multiple Workers each
            operate in their own isolated context. Coordination happens through planning documents, centralized
            Memory, and file-based communication.
          </p>
        </Grid.Region>

        <Grid.Region {...R(regions, 'hw-p1')} id="hw-p1" className={styles.prose}>
          <p className={styles.proseText}>
            The <strong>Planning Phase</strong> starts with the <strong>Planner</strong> doing collaborative
            project discovery by asking targeted questions about requirements, constraints and preferences
            while exploring your codebase. Once you sign off on its understanding, the Planner breaks gathered
            context into three planning documents: a <strong>Spec</strong>, a <strong>Plan</strong> and a <strong>Rules</strong> file for you to review
            and correct before implementation begins.
          </p>
        </Grid.Region>

        <Grid.Region {...R(regions, 'hw-p2')} id="hw-p2" className={styles.prose}>
          <p className={styles.proseText}>
            The <strong>Implementation Phase</strong> is a continuous loop until project completion. The <strong>Manager</strong> assigns Tasks
            based on the Plan's dependencies and reviews outcomes. <strong>Workers</strong> execute assigned tasks, log their
            work to <strong>Memory</strong>, and report back. You trigger every step through a file-based communication system.
            When any agent's context window fills, you can perform a <strong>Handoff</strong> to capture working context so the
            next instance picks up without gaps.
          </p>
        </Grid.Region>

        <Grid.Region {...R(regions, 'vis')} id="vis" className={styles.visual}>
          <ContentViewer />
        </Grid.Region>

        {/* ===== CTA BUTTONS (all views, after How It Works) ===== */}
        <Grid.Region {...R(regions, 'cta')} id="cta" className={styles.ctaRegion}>
          <a href="/docs/getting-started" className={styles.ctaBtn}>See Documentation</a>
          <a href={GITHUB_URL} className={`${styles.ctaBtn} ${styles.ctaBtnSecondary}`} target="_blank" rel="noopener">View on GitHub</a>
        </Grid.Region>

        {/* ===== CONTRIBUTORS ===== */}
        <Grid.Region {...R(regions, 'ctr')} id="ctr" className={styles.contributors}>
          <div className={styles.ctrInner} ref={ctrRef}>
            <span className={styles.ctrLabel}>CONTRIBUTORS</span>
            <div className={styles.ctrAvatars}>
              {contributors.slice(0, 12).map((c, i) => (
                <a key={c.login} href={c.url} target="_blank" rel="noopener noreferrer" title={c.login} style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={c.avatar} alt={c.login} className={`${styles.ctrAvatar} ${ctrVisible ? styles.ctrAvatarVisible : ''}`}
                    style={ctrVisible ? { animationDelay: `${i * 0.08}s` } : undefined} width="22" height="22" loading="lazy" />
                </a>
              ))}
              {contributors.length > 12 && <span className={styles.ctrMore}>+{contributors.length - 12}</span>}
            </div>
          </div>
        </Grid.Region>

        {/* ===== FOOTER BAR ===== */}
        <Grid.Region {...R(regions, 'ftr')} id="ftr" className={styles.bar}>
          <div className={`${styles.barInner} ${styles.footerInner}`}>
            <div className={styles.barLeft}>
              <span className={styles.copyright}>
                {new Date().getFullYear()} Agentic Project Management · Licensed under{' '}
                <a href={GITHUB_LICENSE_URL} className={styles.licenseLink} target="_blank" rel="noopener">MPL 2.0</a>
              </span>
            </div>
            <a href="https://github.com/sdi2200262" className={styles.mascot} target="_blank" rel="noopener noreferrer" title="sdi2200262">
              <img src="/img/cobuter-man-black-and-white-no-bg.png" alt="" className={`${styles.mascotImg} ${styles.mascotDefault}`} />
              <img src="/img/cobuter-man-black-and-white-no-bg-hover.png" alt="" className={`${styles.mascotImg} ${styles.mascotHover}`} />
            </a>
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

export default function Home() {
  return (
    <Layout title="Agentic Project Management" description="Manage complex projects with a team of AI agents, smoothly and efficiently." noFooter>
      <HomeContent />
    </Layout>
  );
}
