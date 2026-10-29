import { heroui } from "@heroui/react";

const themes = {
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
  };

export default heroui({ themes: themes as never });
