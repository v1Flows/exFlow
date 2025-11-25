"use client";

import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Kbd,
  ScrollShadow,
  Spacer,
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
        "hidden h-full flex-col border-r border-white/10 bg-content1/60 backdrop-blur-md transition-all lg:flex",
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
              radius="none"
              shadow="none"
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
              radius="none"
              shadow="none"
              src={`/images/justlab_logo_minimal_transparent.png`}
              width={22}
            />
          )}
        </NextLink>
      </div>

      <Divider className="bg-white/10" />

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
              <Button isIconOnly variant="light" onPress={onOpen}>
                <Icon icon="hugeicons:search-01" width={20} />
              </Button>
            ) : (
              <Button
                fullWidth
                className="justify-between bg-default-100/50 text-default-500"
                endContent={<Kbd keys={["command"]}>K</Kbd>}
                startContent={<Icon icon="hugeicons:search-01" width={18} />}
                variant="flat"
                onPress={onOpen}
              >
                Search...
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
              <Tooltip
                key={item.href}
                content={isCollapsed ? item.label : null}
                placement="right"
              >
                <NextLink
                  className={clsx(
                    "flex items-center gap-3 rounded-large px-3 py-2.5 transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-default-500 hover:bg-default-100/50 hover:text-foreground",
                    isCollapsed && "justify-center px-0",
                  )}
                  href={item.href}
                >
                  {/* We need icons for nav items. Assuming siteConfig has them or we map them */}
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
                  {!isCollapsed && <span>{item.label}</span>}
                </NextLink>
              </Tooltip>
            );
          })}
        </div>

        <Spacer y={4} />

        {/* Admin Section */}
        {userDetails.role === "admin" && (
          <>
            {!isCollapsed && (
              <p className="px-2 text-xs font-bold uppercase text-default-400">
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
                  label: "Users",
                  href: "/admin/users",
                  icon: "hugeicons:location-user-02",
                },
              ].map((item) => (
                <Tooltip
                  key={item.href}
                  content={isCollapsed ? item.label : null}
                  placement="right"
                >
                  <NextLink
                    className={clsx(
                      "flex items-center gap-3 rounded-large px-3 py-2.5 transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-danger/10 text-danger font-medium"
                        : "text-default-500 hover:bg-default-100/50 hover:text-foreground",
                      isCollapsed && "justify-center px-0",
                    )}
                    href={item.href}
                  >
                    <Icon icon={item.icon} width={22} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NextLink>
                </Tooltip>
              ))}
            </div>
          </>
        )}
      </ScrollShadow>

      <Divider className="bg-white/10" />

      {/* User Profile */}
      <div className={clsx("p-4", isCollapsed && "flex justify-center")}>
        <Dropdown placement="top-start">
          <DropdownTrigger>
            <div
              className={clsx(
                "flex cursor-pointer items-center gap-3 rounded-large p-2 transition-colors hover:bg-default-100/50",
                isCollapsed && "justify-center p-0",
              )}
            >
              <Avatar
                isBordered
                className="transition-transform"
                color="primary"
                name={userDetails.username}
                size="sm"
              />
              {!isCollapsed && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {userDetails.username}
                  </span>
                  <span className="truncate text-xs text-default-400">
                    {userDetails.email}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <Icon
                  className="text-default-400"
                  icon="hugeicons:arrow-up-01"
                  width={16}
                />
              )}
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">
                {userDetails.username}
                {userDetails.role === "admin" && (
                  <span className="ml-1 font-bold text-danger">Admin</span>
                )}
              </p>
            </DropdownItem>
            <DropdownItem
              key="settings"
              showDivider
              startContent={
                <Icon icon="hugeicons:user-id-verification" width={20} />
              }
              onPress={() => router.push("/profile")}
            >
              View Profile
            </DropdownItem>
            <DropdownItem
              key="theme"
              startContent={
                <Icon
                  icon={
                    theme === "light" ? "hugeicons:moon-01" : "hugeicons:sun-01"
                  }
                  width={20}
                />
              }
              onPress={onChangeTheme}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </DropdownItem>
            <DropdownItem
              key="logout"
              className="text-danger"
              color="danger"
              startContent={<Icon icon="hugeicons:logout-02" width={20} />}
              onPress={LogoutHandler}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {/* Collapse Toggle */}
      <div className="flex justify-center border-t border-white/10 py-2">
        <Button
          isIconOnly
          className="text-default-400"
          size="sm"
          variant="light"
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
