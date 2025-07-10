/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      'primary':"#5F6FFF"
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}