"use client";

import {
  Avatar,
  Button,
  Divider,
  Image,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import Search from "@/components/search/search";
import { useSearch } from "@/components/search/search-context";

export default function MobileNav({
  userDetails,
  flows,
  projects,
  folders,
}: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const currentPath = pathname.split("/")?.[1];
  const { onOpen } = useSearch();

  return (
    <Navbar
      className="border-b border-white/10 bg-content1/60 backdrop-blur-md lg:hidden"
      isMenuOpen={isMenuOpen}
      maxWidth="full"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image
              alt="Logo"
              height={32}
              radius="none"
              shadow="none"
              src={`/images/ef_logo_512.png`}
              width={32}
            />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="end">
        <Search
          flows={flows}
          folders={folders}
          projects={projects}
          trigger={
            <Button isIconOnly variant="light" onPress={onOpen}>
              <Icon icon="hugeicons:search-01" width={20} />
            </Button>
          }
        />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="bg-content1/60 backdrop-blur-md pt-6">
        <ScrollShadow className="h-full w-full">
          <div className="flex flex-col gap-2">
            {siteConfig.navItems.map((item) => {
              const isActive =
                "/" + currentPath === item.href ||
                (item.href === "/" && pathname === "/");

              return (
                <NavbarMenuItem key={item.href}>
                  <NextLink
                    className={clsx(
                      "flex items-center gap-3 rounded-large px-3 py-3 transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-default-500 hover:bg-default-100/50 hover:text-foreground",
                    )}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon
                      icon={
                        item.label === "Home"
                          ? "hugeicons:home-01"
                          : item.label === "Projects"
                            ? "hugeicons:ai-folder-01"
                            : item.label === "Flows"
                              ? "hugeicons:workflow-square-10"
                              : "hugeicons:dashboard-square-02"
                      }
                      width={22}
                    />
                    <span className="text-lg">{item.label}</span>
                  </NextLink>
                </NavbarMenuItem>
              );
            })}

            <Divider className="my-2 bg-white/10" />

            {userDetails.role === "admin" && (
              <>
                <p className="px-2 text-xs font-bold uppercase text-default-400">
                  Admin
                </p>
                {[
                  {
                    label: "System",
                    href: "/admin/system",
                    icon: "hugeicons:configuration-01",
                  },
                  {
                    label: "Projects",
                    href: "/admin/projects",
                    icon: "hugeicons:ai-folder-01",
                  },
                  {
                    label: "Flows",
                    href: "/admin/flows",
                    icon: "hugeicons:workflow-square-10",
                  },
                  {
                    label: "Executions",
                    href: "/admin/executions",
                    icon: "hugeicons:rocket-02",
                  },
                  {
                    label: "Runners",
                    href: "/admin/runners",
                    icon: "hugeicons:ai-brain-04",
                  },
                  {
                    label: "Users",
                    href: "/admin/users",
                    icon: "hugeicons:location-user-02",
                  },
                ].map((item) => (
                  <NavbarMenuItem key={item.href}>
                    <NextLink
                      className={clsx(
                        "flex items-center gap-3 rounded-large px-3 py-3 transition-colors",
                        pathname.startsWith(item.href)
                          ? "bg-danger/10 text-danger font-medium"
                          : "text-default-500 hover:bg-default-100/50 hover:text-foreground",
                      )}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon icon={item.icon} width={22} />
                      <span className="text-lg">{item.label}</span>
                    </NextLink>
                  </NavbarMenuItem>
                ))}
              </>
            )}

            <Divider className="my-2 bg-white/10" />

            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar
                isBordered
                color="primary"
                name={userDetails.username}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {userDetails.username}
                </span>
                <span className="text-xs text-default-400">
                  {userDetails.email}
                </span>
              </div>
            </div>
          </div>
        </ScrollShadow>
      </NavbarMenu>
    </Navbar>
  );
}
