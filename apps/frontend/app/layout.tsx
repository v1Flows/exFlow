/* eslint-disable import/order */
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import Sidebar from "@/components/sidebar/sidebar";
import MobileNav from "@/components/sidebar/mobile-nav";
import { AppContent } from "@/components/app-content";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import Footer from "@/components/footer/footer";
import PageGetSettings from "@/lib/fetch/page/settings";
import Favicon from "/public/favicon.ico";

import GetFlows from "@/lib/fetch/flow/all";
import GetProjects from "@/lib/fetch/project/all";
import GetFolders from "@/lib/fetch/folder/all";

import { Providers } from "./providers";

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
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  // get the current page the user is on
  const headersList = await headers();
  const currentPage = headersList.get("x-pathname") || "/";

  const userDetailsData = GetUserDetails();
  const settingsData = PageGetSettings();
  const flowsData = GetFlows();
  const projectsData = GetProjects();
  const foldersData = GetFolders();

  const [userDetails, settings, flows, projects, folders] = await Promise.all([
    userDetailsData,
    settingsData,
    flowsData,
    projectsData,
    foldersData,
  ]);

  const c = await cookies();
  const session = c.get("session")?.value;

  const isPortal = currentPage.startsWith("/portal");

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
          <AppContent>
            <div className="flex h-screen w-full overflow-hidden bg-background">
              {sessionCookie && currentPage !== "/setup" && !isPortal && (
                <Sidebar
                  flows={flows.success ? flows.data.flows : []}
                  folders={folders.success ? folders.data.folders : []}
                  projects={projects.success ? projects.data.projects : []}
                  session={session}
                  settings={settings.success ? settings.data.settings : {}}
                  userDetails={userDetails.success ? userDetails.data.user : {}}
                />
              )}
              <div className="flex flex-1 flex-col h-full overflow-hidden relative">
                {sessionCookie && currentPage !== "/setup" && !isPortal && (
                  <MobileNav
                    flows={flows.success ? flows.data.flows : []}
                    folders={folders.success ? folders.data.folders : []}
                    projects={projects.success ? projects.data.projects : []}
                    session={session}
                    settings={settings.success ? settings.data.settings : {}}
                    userDetails={
                      userDetails.success ? userDetails.data.user : {}
                    }
                  />
                )}
                <main className={clsx("flex-1 overflow-y-auto scrollbar-hide", !isPortal && "pt-4 px-6")}>
                  {children}
                  {!isPortal && <Footer />}
                </main>
              </div>
            </div>
          </AppContent>
        </Providers>
      </body>
    </html>
  );
}
