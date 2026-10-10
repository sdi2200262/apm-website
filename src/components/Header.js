import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import Brand from './Brand';
import GitHub from './GitHub';
import { reduced } from '../browser';

// The book pages' header (landing, Research), in place of the Docusaurus navbar: the shared brand, then Docs, Research
// (underlined on its own page, as the navbar marks the current section) and GitHub; its bottom rule shows once the
// page scrolls past 4px. On the landing page (`home`) the brand scrolls back
// to the top instead of linking home. `seed` shares the page's mark. Styles: .topbar in src/css/custom.css.
export default function Header({ seed, home = false }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const toTop = (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }); };
  const research = useLocation().pathname.startsWith('/research');
  return (
    <header className={`topbar${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap strip">
        <Brand seed={seed} onClick={home ? toTop : undefined} />
        <nav>
          <Link to="/docs/introduction">Docs</Link>
          <Link to="/research" aria-current={research ? 'page' : undefined}>Research</Link>
          <GitHub />
        </nav>
      </div>
    </header>
  );
}
