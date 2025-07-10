// postcss.config.js
export default {
  plugins: {
    tailwindcss: {}, // This is the problematic line in your current setup
    autoprefixer: {},
  },
}