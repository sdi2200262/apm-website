/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false, // Disable Tailwind's reset — Docusaurus has its own
  },
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        apm: {
          bg: 'var(--apm-bg)',
          grid: 'var(--apm-grid)',
          border: 'var(--apm-border)',
          t1: 'var(--apm-t1)',
          t2: 'var(--apm-t2)',
          t3: 'var(--apm-t3)',
          accent: 'var(--apm-accent)',
          accent2: 'var(--apm-accent2)',
          'cmd-bg': 'var(--apm-cmd-bg)',
          'cmd-border': 'var(--apm-cmd-border)',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        apm: '3px',
      },
    },
  },
  plugins: [],
};
