/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-sans)"],
      },
      colors: {
        accent: {
          500: "#f46523" /* this is our accent */,
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    require("tailwind-scrollbar"),
  ],
};
