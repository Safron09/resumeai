/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#13131A',
        accent: '#6EE7B7',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
