/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        ink: '#14202b',
        paper: '#f6f8fa',
        principal: '#0e7c7b',
        interest: '#e0a526',
      },
    },
  },
  plugins: [],
};
