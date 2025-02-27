import "../styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { CookiesProvider } from "next-client-cookies/server";

import { NextAuthProvider } from "../components/providers/NextAuthProvider";
import { sccsLD, siteConfig } from "../config/site";
import { fontSans } from "../config/fonts";
import { Navbar } from "../components/navbar";
import FooterInfo from "../components/FooterInfo";

import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#31425D" },
    { media: "(prefers-color-scheme: dark)", color: "#141C2A" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CookiesProvider>
      <NextAuthProvider>
        <html suppressHydrationWarning lang="en">
          <head>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(sccsLD) }}
            />
          </head>
          <body
            suppressHydrationWarning
            className={clsx(
              "min-h-screen bg-background font-sans antialiased",
              fontSans.variable
            )}
          >
            <Providers
              themeProps={{
                children: children,
                attribute: "class",
                defaultTheme: "dark",
              }}
            >
              <div className="flex flex-col h-screen ">
                <Navbar />
                <main className="container mx-auto lg:mx-0 px-1 lg:px-7 lg:pt-5 justify-center items-center flex-grow max-w-full">
                  {children}
                </main>
                <FooterInfo />
              </div>
            </Providers>
          </body>
        </html>
      </NextAuthProvider>
    </CookiesProvider>
  );
}
