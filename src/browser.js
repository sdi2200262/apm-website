// Small browser helpers shared by components.

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const supportsThemeChange = () => reduced() || typeof document.startViewTransition === 'function';

// ClipboardItem keeps the write inside Safari's click gesture while text loads. An async function
// turns missing-API errors into rejected promises.
export const copyText = async (text) =>
  navigator.clipboard.write([new ClipboardItem({ 'text/plain': Promise.resolve(text).then((t) => new Blob([t], { type: 'text/plain' })) })]);
