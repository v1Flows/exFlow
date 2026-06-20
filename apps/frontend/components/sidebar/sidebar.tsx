"use client";
import Image from "next/image";
import {
  Avatar,
  Button,
  Dropdown,
  Kbd,
  ScrollShadow,
  Separator,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { Logout } from "@/lib/logout";
import Search from "@/components/search/search";
import { useSearch } from "@/components/search/search-context";
export default function Sidebar({
  userDetails,
  flows,
  projects,
  folders,
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { onOpen } = useSearch();
  const currentPath = pathname.split("/")?.[1];
  async function LogoutHandler() {
    await Logout();
  }
  const onChangeTheme = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };
  return (
    <div
      className={clsx(
        "hidden h-full flex-col border-r border-white/10 bg-surface/60 backdrop-blur-md transition-all lg:flex",
        isCollapsed ? "w-20" : "w-72",
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-6">
        <NextLink className="flex items-center gap-2" href="/">
          {!isCollapsed ? (
            <Image
              alt="Logo"
              height={122}
              src={
                theme === "light"
                  ? `/images/justflow_logo_full_transparent_dark.png`
                  : `/images/justflow_logo_full_transpartent_white.png`
              }
              width={122}
            />
          ) : (
            <Image
              alt="Logo"
              height={22}
              src={`/images/justlab_logo_minimal_transparent.png`}
              width={22}
            />
          )}
        </NextLink>
      </div>

      <Separator className="bg-white/10" />

      {/* Search */}
      <div
        className={clsx("px-4 py-4", isCollapsed ? "flex justify-center" : "")}
      >
        <Search
          flows={flows}
          folders={folders}
          projects={projects}
          trigger={
            isCollapsed ? (
              <Button
                variant="ghost"
                onPress={onOpen}
                className="aspect-square p-0"
              >
                <Icon icon="hugeicons:search-01" width={20} />
              </Button>
            ) : (
              <Button
                className="justify-between bg-default/50 text-muted"
                variant="tertiary"
                onPress={onOpen}
              >
                {<Icon icon="hugeicons:search-01" width={18} />}
                Search...
                {<Kbd>K</Kbd>}
              </Button>
            )
          }
        />
      </div>

      {/* Navigation */}
      <ScrollShadow className="flex-1 px-4">
        <div className="flex flex-col gap-1">
          {siteConfig.navItems.map((item) => {
            const isActive =
              "/" + currentPath === item.href ||
              (item.href === "/" && pathname === "/");
            return (
              <Tooltip key={item.href}>
                <Tooltip.Trigger>
                  <NextLink
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-muted hover:bg-default/50 hover:text-foreground",
                      isCollapsed && "justify-center px-0",
                    )}
                    href={item.href}
                  >
                    {/* We need icons for nav items. Assuming siteConfig has them or we map them */}
                    <Icon
                      icon={
                        item.icon || "hugeicons:circle-01" /* default icon */
                      }
                      width={22}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NextLink>
                </Tooltip.Trigger>
                <Tooltip.Content placement="right">
                  {isCollapsed ? item.label : null}
                </Tooltip.Content>
              </Tooltip>
            );
          })}
        </div>

        <div aria-hidden className="h-4" />

        {/* Services Management — Editor/Admin */}
        {(userDetails.role === "admin" || userDetails.role === "editor") && (
          <>
            {!isCollapsed && (
              <p className="px-2 text-xs font-bold uppercase text-muted">
                Manage
              </p>
            )}
            <div className="mt-2 flex flex-col gap-1">
              <Tooltip>
                <Tooltip.Trigger>
                  <NextLink
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      pathname === "/services/create"
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-muted hover:bg-default/50 hover:text-foreground",
                      isCollapsed && "justify-center px-0",
                    )}
                    href="/services/create"
                  >
                    <Icon icon="hugeicons:add-square" width={22} />
                    {!isCollapsed && <span>Create Service Page</span>}
                  </NextLink>
                </Tooltip.Trigger>
                <Tooltip.Content placement="right">
                  {isCollapsed ? "Create Service Page" : null}
                </Tooltip.Content>
              </Tooltip>
            </div>
            <div aria-hidden className="h-2" />
          </>
        )}

        {/* Admin Section */}
        {userDetails.role === "admin" && (
          <>
            {!isCollapsed && (
              <p className="px-2 text-xs font-bold uppercase text-muted">
                Admin
              </p>
            )}
            <div className="mt-2 flex flex-col gap-1">
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
                <Tooltip key={item.href}>
                  <Tooltip.Trigger>
                    <NextLink
                      className={clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                        pathname.startsWith(item.href)
                          ? "bg-danger/10 text-danger font-medium"
                          : "text-muted hover:bg-default/50 hover:text-foreground",
                        isCollapsed && "justify-center px-0",
                      )}
                      href={item.href}
                    >
                      <Icon icon={item.icon} width={22} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NextLink>
                  </Tooltip.Trigger>
                  <Tooltip.Content placement="right">
                    {isCollapsed ? item.label : null}
                  </Tooltip.Content>
                </Tooltip>
              ))}
            </div>
          </>
        )}
      </ScrollShadow>

      <Separator className="bg-white/10" />

      {/* Profile */}
      <div className={clsx("p-4", isCollapsed && "flex justify-center")}>
        <Dropdown>
          <Dropdown.Trigger>
            <div
              className={clsx(
                "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-default/50",
                isCollapsed && "justify-center p-0",
              )}
            >
              <Avatar className={"transition-transform"} size={"sm"}>
                <Avatar.Fallback>
                  {String("").slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {userDetails.username}
                  </span>
                  <span className="truncate text-xs text-muted">
                    {userDetails.email}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <Icon
                  className="text-muted"
                  icon="hugeicons:arrow-up-01"
                  width={16}
                />
              )}
            </div>
          </Dropdown.Trigger>
          <Dropdown.Popover>
            <Dropdown.Menu aria-label="Profile Actions">
              <Dropdown.Item
                key="profile"
                id="profile"
                className="h-14 gap-2"
                textValue="  "
              >
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">
                  {userDetails.username}
                  {userDetails.role === "admin" && (
                    <span className="ml-1 font-bold text-danger">Admin</span>
                  )}
                  {userDetails.role === "editor" && (
                    <span className="ml-1 font-bold text-accent">Editor</span>
                  )}
                </p>
              </Dropdown.Item>
              <Dropdown.Item
                key="settings"
                id="settings"
                onPress={() => router.push("/profile")}
                textValue="View Profile"
              >
                {<Icon icon="hugeicons:user-id-verification" width={20} />}
                View Profile
              </Dropdown.Item>
              <Dropdown.Item
                key="theme"
                id="theme"
                onPress={onChangeTheme}
                textValue=" "
              >
                {
                  <Icon
                    icon={
                      theme === "light"
                        ? "hugeicons:moon-01"
                        : "hugeicons:sun-01"
                    }
                    width={20}
                  />
                }
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </Dropdown.Item>
              <Dropdown.Item
                key="logout"
                id="logout"
                className="text-danger"
                onPress={LogoutHandler}
                textValue="Log Out"
              >
                {<Icon icon="hugeicons:logout-02" width={20} />}
                Log Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>

      {/* Collapse Toggle */}
      <div className="flex justify-center border-t border-white/10 py-2">
        <Button
          className="text-muted"
          size="sm"
          variant="ghost"
          onPress={() => setIsCollapsed(!isCollapsed)}
        >
          <Icon
            icon={
              isCollapsed
                ? "hugeicons:arrow-right-01"
                : "hugeicons:arrow-left-01"
            }
            width={16}
          />
        </Button>
      </div>
    </div>
  );
}
