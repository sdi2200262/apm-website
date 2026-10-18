import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Mark from '../components/Mark';
import Header from '../components/Header';
import Code from '../components/Code';
import { Wave, useDraw } from '../components/Drawn';
import { Note, useTerms } from '../components/Terms';
import thesis from '@site/research/thesis.json';
import styles from './research.module.css';

// Research overview, a book page like the landing page (shared parts: "Book pages" in src/css/custom.css), with
// its header: the study's cover beside the mark and publication links, then the abstract and the citation. Title, author,
// metadata, abstract and citations come from the thesis (research/thesis.json, scripts/build-thesis.js).
export default function Research() {
  const draw = useDraw();
  const { active, ref, props } = useTerms();
  const pdf = useBaseUrl('/research/thesis.pdf');
  const [name, subtitle] = thesis.title.split(': ');
  return (
    <Layout title="Research" description="The design and evaluation of APM v1, presented in a thesis with a comparative case study.">
      <main className="book">
        <Header seed={draw?.seed} />
        <section className="wrap">
          <div className={`grid2 ${styles.cover}`}>
            <div className={styles.text} ref={ref}>
              <div>
                <h1>{name}</h1>
                <p className="subtitle">{subtitle}</p>
              </div>
              <p>{thesis.author}</p>
              <dl className={styles.meta}>
                <dt>Supervisor</dt><dd>{thesis.supervisor}</dd>
                <dt>Institution</dt><dd>{thesis.institution}</dd>
                <dt>Date</dt><dd>{thesis.date}</dd>
              </dl>
              <p>
                This thesis presents the design and implementation of APM v1 and a reproducible methodology for comparing
                frameworks on top of coding agents.
              </p>
              <p>
                The methodology is applied in a case study with twelve developers. Each completed the same demanding software task
                in two sessions, once with APM and once with GitHub&rsquo;s <button type="button" className="term" aria-controls="speckit-note" {...props('speckit')}>Spec-kit</button>.
                Both frameworks ran on Claude Code with Claude Opus 4.7 or Claude Sonnet 4.6. The comparison covers economic cost,
                process, functional test scores, and developer perception.
              </p>
              <Note id="speckit-note" active={!!active} wave={draw?.note}>
                The study used the Spec-kit releases available during its sessions. The findings concern those versions.
              </Note>
            </div>
            <aside className={styles.rail} aria-label="Research links">
              <div className={styles.mark} aria-hidden="true">{draw && <Mark seed={draw.seed} size={144} intro />}</div>
              <div className={styles.actions}>
                <nav className={styles.links} aria-label="Thesis">
                  <Link to="/research/thesis/introduction">Read thesis</Link>
                  <a href={pdf} download="apm-thesis.pdf">Download PDF</a>
                  <a href={thesis.recordPage} target="_blank" rel="noopener noreferrer" title="Opens in a new tab">View in Pergamos <span aria-hidden="true">↗</span></a>
                </nav>
                <div className={styles.paper}>
                  <p>Paper</p>
                  <p className={styles.status}>In preparation</p>
                </div>
              </div>
            </aside>
          </div>
          <Wave w={draw?.waves[0]} />
        </section>

        <section className="wrap">
          <div className="grid2">
            <h2 className="label">Abstract</h2>
            <div className={styles.text}>{thesis.abstract.map((p) => <p key={p}>{p}</p>)}</div>
          </div>
          <Wave w={draw?.waves[1]} />
        </section>

        <section className="wrap">
          <div className="grid2">
            <h2 className="label">Citations</h2>
            <div className={styles.text}>
              <p>For attribution, please cite this work as:</p>
              <Code block>{thesis.citation}</Code>
              <p>Or with BibTeX:</p>
              <Code block>{thesis.biblatex}</Code>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
