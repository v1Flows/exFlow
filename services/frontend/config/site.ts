export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "JustFlow",
  description: "JustFlow is an workflow automation tool",
  version: "2.0.0-beta.16",
  navItems: [
    {
      label: "Dashboard",
      href: "/",
      icon: "hugeicons:home-01",
    },
    {
      label: "Projects",
      href: "/projects",
      icon: "hugeicons:ai-folder-01",
    },
    {
      label: "Flows",
      href: "/flows",
      icon: "hugeicons:workflow-square-10",
    },
    {
      label: "Alerts",
      href: "/alerts",
      icon: "hugeicons:alert-01",
    },
    {
      label: "Runners",
      href: "/runners",
      icon: "hugeicons:ai-brain-04",
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
