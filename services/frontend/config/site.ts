export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "exFlow",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Flows",
      href: "/flows",
    },
    {
      label: "Runners",
      href: "/runners",
    },
    {
      label: "Settings",
      href: "/settings",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Flows",
      href: "/flows",
    },
    {
      label: "Runners",
      href: "/runners",
    },
    {
      label: "Settings",
      href: "/settings",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    docs: "https://heroui.com",
  },
};
