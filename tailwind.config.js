/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    fontFamily: {
      sans: [
        'TsangerJinKai02',
        'Charter',
        'Georgia',
        'Source Han Serif SC',
        'Noto Serif SC',
        'Songti SC',
        'serif',
      ],
      serif: [
        'TsangerJinKai02',
        'Charter',
        'Georgia',
        'Source Han Serif SC',
        'Noto Serif SC',
        'Songti SC',
        'serif',
      ],
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
