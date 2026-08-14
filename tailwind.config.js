/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    fontFamily: {
      sans: [
        'DM Sans',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'sans-serif',
      ],
      serif: ['Instrument Serif', 'Georgia', 'Times New Roman', 'serif'],
    },
    extend: {
      colors: {
        ink: '#0c0d10',
        panel: '#14161b',
        line: 'rgba(244, 241, 234, 0.1)',
        cream: '#f4f1ea',
        mute: '#8d8b86',
        accent: '#ff6b9d',
      },
    },
  },
  plugins: [],
};
