/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    // Keeps dynamic background image utilities
    { pattern: /bg-\[url\(.*\)\]/ },
    // Keeps horizontal scrolling utilities
    "overflow-x-auto",
    "whitespace-nowrap",
    "scroll-smooth",
    "flex-shrink-0",
    // Optional: gradient fade utility (from-white/to-transparent)
    { pattern: /(from|to)-transparent/ },
    { pattern: /(from|to)-white/ }
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
