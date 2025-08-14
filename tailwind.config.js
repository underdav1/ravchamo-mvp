/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Helvetica','Arial'] },
      boxShadow: {
        'soft': '0 8px 20px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
};
