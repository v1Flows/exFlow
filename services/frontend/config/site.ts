export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "JustFlow",
  description: "JustFlow is an workflow automation tool",
  version: "2.0.0-beta.10",
  navItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Flows",
      href: "/flows",
    },
    {
      label: "Alerts",
      href: "/alerts",
    },
    {
      label: "Runners",
      href: "/runners",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Flows",
      href: "/flows",
    },
    {
      label: "Alerts",
      href: "/alerts",
    },
    {
      label: "Runners",
      href: "/runners",
    },
  ],
  links: {
    github: "https://github.com/JustLABv1/justflow",
    docs: "https://justlab.xyz",
  },
};
