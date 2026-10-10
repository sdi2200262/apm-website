// Small browser helpers shared by components.

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Writes text, or a promise of it, to the clipboard. The ClipboardItem takes the promise, so the write starts inside
// the click even while the text is still loading (Safari drops the gesture after an awaited fetch).
export const copyText = (text) =>
  navigator.clipboard.write([new ClipboardItem({ 'text/plain': Promise.resolve(text).then((t) => new Blob([t], { type: 'text/plain' })) })]);
