import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { ReactNode } from "react";
import { cookies } from "next/headers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import Footer from "@/components/footer/footer";

import { Providers } from "./providers";

import Favicon from "/public/favicon.ico";

const APP_NAME = siteConfig.name;
const APP_DEFAULT_TITLE = siteConfig.name;
const APP_TITLE_TEMPLATE = `%s - ${siteConfig.name}`;
const APP_DESCRIPTION = siteConfig.description;

export const metadata: Metadata = {
  applicationName: APP_NAME,
  icons: [{ rel: "icon", url: Favicon.src }],
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userDetailsData = GetUserDetails();

  const [userDetails] = await Promise.all([userDetailsData]);

  const c = await cookies();
  const session = c.get("session")?.value;

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link href="/manifest.json" rel="manifest" />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex h-screen flex-col">
            <Navbar
              session={session}
              userDetails={userDetails.success ? userDetails.data.user : {}}
            />
            <main className="pt-4 px-6 flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
