/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#23BD00',
          white: '#FFFFFF',
          black: '#000000',
        }
      }
    },
  },
  plugins: [],
}
