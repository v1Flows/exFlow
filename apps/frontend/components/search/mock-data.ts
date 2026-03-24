const searchData = {
  common: [
    {
      slug: "common-home",
      component: {
        name: "Home",
        slug: "common-home",
        icon: "solar:home-smile-outline",
        attributes: {
          group: "common",
          groupOrder: 1,
          iframe: {
            initialHeight: 220,
            initialMobileHeight: 220,
          },
        },
      },
      url: "/",
      group: {
        key: "dashboard",
        name: "Dashboard",
      },
      content: "Home",
    },
    {
      slug: "common-projects",
      component: {
        name: "Projects",
        slug: "common-projects",
        icon: "hugeicons:ai-folder-01",
        attributes: {
          group: "common",
          groupOrder: 2,
          iframe: {
            initialHeight: 220,
            initialMobileHeight: 220,
          },
        },
      },
      url: "/projects",
      group: {
        key: "dashboard",
        name: "dashboard",
      },
      content: "Projects",
    },
    {
      slug: "common-flows",
      component: {
        name: "Flows",
        slug: "common-flows",
        icon: "hugeicons:workflow-square-10",
        attributes: {
          group: "common",
          groupOrder: 3,
          iframe: {
            initialHeight: 220,
            initialMobileHeight: 220,
          },
        },
      },
      url: "/flows",
      group: {
        key: "dashboard",
        name: "Dashboard",
      },
      content: "Flows",
    },
    {
      slug: "common-runners",
      component: {
        name: "Runners",
        slug: "common-runners",
        icon: "hugeicons:ai-brain-04",
        attributes: {
          group: "common",
          groupOrder: 4,
          iframe: {
            initialHeight: 220,
            initialMobileHeight: 220,
          },
        },
      },
      url: "/runners",
      group: {
        key: "dashboard",
        name: "Dashboard",
      },
      content: "Runners",
    },
    {
      slug: "common-profile",
      component: {
        name: "Profile",
        slug: "common-profile",
        icon: "hugeicons:user-id-verification",
        attributes: {
          group: "common",
          groupOrder: 5,
          iframe: {
            initialHeight: 220,
            initialMobileHeight: 220,
          },
        },
      },
      url: "/profile",
      group: {
        key: "dashboard",
        name: "Dashboard",
      },
      content: "Profile",
    },
  ],
  projects: [],
  flows: [],
  folders: [],
};

export { searchData };
