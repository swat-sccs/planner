export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "SCCS Course Planner",
  description: "Version 2 of the Course Planner provided by SCCS",
  navItems: [
    {
      label: "Plan",
      href: "/",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Leave a Rating",
      href: "/rating",
    },
  ],
  navMenuItems: [
    {
      label: "Plan",
      href: "/",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};

export const sccsLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Swarthmore College Computer Society",
  logo: "https://www.sccs.swarthmore.edu/static/apple-touch-icon.png",
  description:
    "The Swarthmore College Computer Society (SCCS) is a student-run group offering computing services, tools, toys, and information to the Swarthmore College community",
  url: "https://www.sccs.swarthmore.edu/",
  email: "staff@sccs.swarthmore.edu",
  address: {
    "@type": "PostalAddress",
    streetAddress: "500 College Ave",
    addressLocality: "Swarthmore",
    addressCountry: "US",
    addressRegion: "Pennsylvania",
    postalCode: "19081",
  },
};
