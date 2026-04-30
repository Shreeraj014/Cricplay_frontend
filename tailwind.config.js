/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'cric-dark': '#1e1e1e',
        'cric-green': '#10b981',
        'cric-red': '#ef4444',
      }
    },
  },
  plugins: [],
}