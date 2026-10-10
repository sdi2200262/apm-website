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
// its header: the study's cover beside the mark and the publication links, then the abstract and the citation. Title, author,
// metadata, abstract and citations come from the thesis (research/thesis.json, scripts/build-thesis.js).
export default function Research() {
  const draw = useDraw();
  const { active, ref, props } = useTerms();
  const pdf = useBaseUrl('/research/thesis.pdf');
  const [name, subtitle] = thesis.title.split(': ');
  return (
    <Layout title="Research" description={thesis.abstract[0]}>
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
                APM v1 has been presented and empirically evaluated as a framework for AI-assisted software engineering. The work
                describes its design and introduces a reproducible methodology for evaluating frameworks built on top of coding agents
                and similar human-in-the-loop workflows. To our knowledge, this is among the first methodologies for evaluating these
                frameworks in use by developers.
              </p>
              <p>
                The methodology was applied in a comparative case study with twelve developers. Each attempted the same demanding
                software task once with APM and once with GitHub&rsquo;s <button type="button" className="term" aria-controls="speckit-note" {...props('speckit')}>Spec-kit</button>.
                The comparison examines cost, development process, functional outcomes, and developer perception.
              </p>
              <p>A paper adaptation is in preparation.</p>
              <Note id="speckit-note" active={!!active} wave={draw?.note}>
                The comparison used the Spec-kit releases available in the study&rsquo;s time window. The findings concern those
                versions, which predate the current release.
              </Note>
            </div>
            <div className={styles.rail}>
              <div className={styles.mark}>{draw && <Mark seed={draw.seed} size={144} intro />}</div>
              <nav className={styles.links} aria-label="Publications">
                <Link to="/research/thesis/introduction">Read thesis</Link>
                <a href={pdf} download="apm-thesis.pdf">Download PDF</a>
                <Link to="/research/paper">Read paper</Link>
              </nav>
            </div>
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
