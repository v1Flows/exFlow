"use client";
import Image from "next/image";
import { Avatar, Button, Drawer, ScrollShadow, Separator } from "@heroui/react";
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
    <>
      <header className="border-b border-default bg-surface/60 backdrop-blur-md lg:hidden">
        <div className="flex h-16 w-full items-center justify-between px-4">
          <div className="flex basis-1/5 sm:basis-full">
            <div className="gap-3 max-w-fit">
              <NextLink
                className="flex justify-start items-center gap-1"
                href="/"
              >
                <Image
                  alt="Logo"
                  height={32}
                  src={`/images/ef_logo_512.png`}
                  width={32}
                />
                <p className="font-bold text-inherit">{siteConfig.name}</p>
              </NextLink>
            </div>
          </div>

          <div className="flex basis-1/5 items-center justify-end gap-2 sm:basis-full">
            <Search
              flows={flows}
              folders={folders}
              projects={projects}
              trigger={
                <Button
                  variant="ghost"
                  onPress={onOpen}
                  className="aspect-square p-0"
                >
                  <Icon icon="hugeicons:search-01" width={20} />
                </Button>
              }
            />
            <Button
              aria-label="Open navigation"
              className="aspect-square p-0"
              variant="ghost"
              onPress={() => setIsMenuOpen(true)}
            >
              <Icon icon="hugeicons:menu-01" width={22} />
            </Button>
          </div>
        </div>
      </header>

      <Drawer>
        <Drawer.Backdrop isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Drawer.Header>
                <Drawer.Heading>Navigation</Drawer.Heading>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body className="bg-surface/60 pt-2 backdrop-blur-md">
                <nav aria-label="Mobile navigation" className="h-full">
                  <ScrollShadow className="h-full w-full">
                    <div className="flex flex-col gap-2">
                      {siteConfig.navItems.map((item) => {
                        const isActive =
                          "/" + currentPath === item.href ||
                          (item.href === "/" && pathname === "/");
                        return (
                          <div key={item.href}>
                            <NextLink
                              className={clsx(
                                "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                                isActive
                                  ? "bg-accent/10 text-accent font-medium"
                                  : "text-muted hover:bg-default/50 hover:text-foreground",
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
                          </div>
                        );
                      })}

                      <Separator className="my-2 bg-white/10" />

                      {userDetails.role === "admin" && (
                        <>
                          <p className="px-2 text-xs font-bold uppercase text-muted">
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
                              label: "s",
                              href: "/admin/users",
                              icon: "hugeicons:location-user-02",
                            },
                          ].map((item) => (
                            <div key={item.href}>
                              <NextLink
                                className={clsx(
                                  "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                                  pathname.startsWith(item.href)
                                    ? "bg-danger/10 text-danger font-medium"
                                    : "text-muted hover:bg-default/50 hover:text-foreground",
                                )}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <Icon icon={item.icon} width={22} />
                                <span className="text-lg">{item.label}</span>
                              </NextLink>
                            </div>
                          ))}
                        </>
                      )}

                      <Separator className="my-2 bg-white/10" />

                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar size={"sm"}>
                          <Avatar.Fallback>
                            {String(userDetails.username)
                              .slice(0, 2)
                              .toUpperCase()}
                          </Avatar.Fallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {userDetails.username}
                          </span>
                          <span className="text-xs text-muted">
                            {userDetails.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ScrollShadow>
                </nav>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}
