/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'green-deep':   '#0C1E13',
        'green-dark':   '#163324',
        'green-mid':    '#2A6E47',
        'green-bright': '#38A05F',
        'green-light':  '#65C285',
        'green-pale':   '#A8DFC0',
        'green-mist':   '#E4F5EC',
        'gold':         '#D4A832',
        'gold-light':   '#F0CC6A',
        'earth':        '#7A5C38',
      },
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
        amiri:  ['Amiri', 'serif'],
      },
    },
  },
  plugins: [],
}