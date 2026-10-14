import React, { useEffect, useRef, useState } from 'react';
import { copyText } from '../browser';

// Text in a panel with a Copy link: the landing page's commands,
// Research's citations (`block`: wrapped lines under the Copy link, on its own row). Copy writes the text itself,
// whatever its wrapping on screen. Styles: .code in src/css/custom.css.
export default function Code({ children, block = false }) {
  const [label, setLabel] = useState('Copy');
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = () => {
    copyText(children).then(() => {
      setLabel('Copied');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setLabel('Copy'), 1600);
    }, () => {});
  };
  return (
    <div className={`code${block ? ' code--block' : ''}`}>
      <pre>{children}</pre>
      <button type="button" className="copy" onClick={copy}>{label}</button>
    </div>
  );
}
