/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        line: {
          green: '#00c300',
          blue: '#00bcd4',
        },
      },
    },
  },
  plugins: [],
}
