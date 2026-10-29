import { nextui } from "@nextui-org/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
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
    nextui({
      themes: {
        light: {
          colors: {
            background: "#E5E7EB",
            background_navbar: "#31425E",
            background_layer: "#31425E",
            foreground: "#000000",
            light_foreground: "#F1F1F1",
            primary: {
              DEFAULT: "#9FADBC",
              foreground: "#31425E",
            },
            secondary: "#F46523",
            focus: "#F46523",
          },
        },
        dark: {
          colors: {
            background: "#0C1019",
            background_navbar: "#151D2B",
            background_layer: "#2C2C33",
            foreground: "#D9D9D9",
            light_foreground: "#181C25",
            primary: {
              DEFAULT: "#9FADBC",
              foreground: "#1D2125",
            },
            secondary: "#F46523",
            focus: "#F46523",
          },
        },
      },
    }),
    require("tailwind-scrollbar"),
  ],
};
