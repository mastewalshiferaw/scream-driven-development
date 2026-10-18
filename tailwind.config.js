/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        term: '#39ff14',  // terminal green
        err: '#ff2e44',   // error red
      },
    },
  },
  plugins: [],
};