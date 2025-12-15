/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        redBright: '#FF1E1E',
        orangeBright: '#FF6B00',
        yellowBright: '#FFD60A',
      },
      animation: {
        gradientShift: 'gradientShift 10s ease infinite',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
