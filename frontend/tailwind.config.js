/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // or other root HTML file
    "./src/**/*.{js,jsx,ts,tsx}",
    // Add other paths if you have components outside src
  ],
  theme: {
    extend: {
      colors:{
        'primary':"#5f6fff" // Custom color
      },
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px,1fr))' // Custom grid template
      }
    },
  },
  plugins: [],
}