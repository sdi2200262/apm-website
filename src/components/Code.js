import React, { useEffect, useRef, useState } from 'react';
import { copyText } from '../browser';

// Text in a panel with a Copy link ("Select and copy" if the clipboard refuses): the landing page's commands,
// Research's citations (`block`: wrapped lines under the Copy link, on its own row). Copy writes the text itself,
// whatever its wrapping on screen. Styles: .code in src/css/custom.css.
export default function Code({ children, block = false }) {
  const [label, setLabel] = useState('Copy');
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = () => {
    const done = (ok) => {
      setLabel(ok ? 'Copied' : 'Select and copy');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setLabel('Copy'), 1600);
    };
    copyText(children).then(() => done(true), () => done(false));
  };
  return (
    <div className={`code${block ? ' code--block' : ''}`}>
      <pre>{children}</pre>
      <button type="button" className="copy" onClick={copy}>{label}</button>
    </div>
  );
}
