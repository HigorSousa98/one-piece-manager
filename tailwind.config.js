/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pirate-gold': '#FFD700',
        'ocean-blue': '#006994',
        'devil-fruit': '#8B0000',
      }
    },
  },
  plugins: [],
}