import { tv } from "tailwind-variants";

export const title = tv({
  base: "tracking-tight inline font-semibold",
  variants: {
    color: {
      violet: "from-[#FF1CF7] to-[#b249f8]",
      yellow: "from-[#FF705B] to-[#FFB457]",
      blue: "from-[#5EA2EF] to-[#0072F5]",
      cyan: "from-[#00b7fa] to-[#01cfea]",
      green: "from-[#6FEE8D] to-[#17c964]",
      pink: "from-[#FF72E1] to-[#F54C7A]",
      logo: "from-[#F46523] to-[#9FADBC]",
      foreground: "dark:from-[#FFFFFF] dark:to-[#4B4B4B]",
    },
    size: {
      xs: "text-2xl",
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl leading-9",
      lg: "text-4xl lg:text-6xl",
    },
    fullWidth: {
      true: "w-full block",
    },
  },
  defaultVariants: {
    size: "md",
  },
  compoundVariants: [
    {
      color: [
        "violet",
        "yellow",
        "blue",
        "cyan",
        "green",
        "pink",
        "logo",
        "foreground",
      ],
      class: "bg-clip-text text-transparent bg-gradient-to-b",
    },
  ],
});

export const subtitle = tv({
  base: "w-full md:w-1/2 my-2 text-lg lg:text-xl text-default-600 block max-w-full",
  variants: {
    fullWidth: {
      true: "!w-full",
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
});

export const courseColors = [
  "bg-[color:hsl(0deg_60%_50%)] dark:bg-[color:hsl(0deg_60%_35%)]",
  "bg-[color:hsl(21.17deg_60%_50%)] dark:bg-[color:hsl(21.17deg_60%_35%)]",
  "bg-[color:hsl(42.34deg_60%_50%)] dark:bg-[color:hsl(42.34deg_60%_35%)]",
  "bg-[color:hsl(63.51deg_60%_50%)] dark:bg-[color:hsl(63.51deg_60%_35%)]",
  "bg-[color:hsl(84.68deg_60%_50%)] dark:bg-[color:hsl(84.68deg_60%_35%)]",
  "bg-[color:hsl(105.85deg_60%_50%)] dark:bg-[color:hsl(105.85deg_60%_35%)]",
  "bg-[color:hsl(127.02deg_60%_50%)] dark:bg-[color:hsl(127.02deg_60%_35%)]",
  "bg-[color:hsl(148.19deg_60%_50%)] dark:bg-[color:hsl(148.19deg_60%_35%)]",
  "bg-[color:hsl(169.36deg_60%_50%)] dark:bg-[color:hsl(169.36deg_60%_35%)]",
  "bg-[color:hsl(190.53deg_60%_50%)] dark:bg-[color:hsl(190.53deg_60%_35%)]",
  "bg-[color:hsl(211.70deg_60%_50%)] dark:bg-[color:hsl(211.70deg_60%_35%)]",
  "bg-[color:hsl(232.87deg_60%_50%)] dark:bg-[color:hsl(232.87deg_60%_35%)]",
  "bg-[color:hsl(254.04deg_60%_50%)] dark:bg-[color:hsl(254.04deg_60%_35%)]",
  "bg-[color:hsl(275.21deg_60%_50%)] dark:bg-[color:hsl(275.21deg_60%_35%)]",
  "bg-[color:hsl(296.38deg_60%_50%)] dark:bg-[color:hsl(296.38deg_60%_35%)]",
  "bg-[color:hsl(317.55deg_60%_50%)] dark:bg-[color:hsl(317.55deg_60%_35%)]",
];

export function generateColorFromName(name: string) {
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) {
      hash += name.charCodeAt(i) * i;
    }
  }

  return courseColors[hash % courseColors.length];
}
