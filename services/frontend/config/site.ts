export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "exFlow",
  description: "exFlow is an workflow automation tool",
  version: "1.0.0-beta3",
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
      label: "Runners",
      href: "/runners",
    },
  ],
  links: {
    github: "https://github.com/v1Flows/exFlow",
    docs: "https://exflow.org",
  },
};
