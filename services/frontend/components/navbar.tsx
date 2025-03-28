"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Kbd,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Avatar,
  Input,
  addToast,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo } from "@/components/icons";
import { Logout } from "@/lib/logout";

export const Navbar = ({ userDetails, session }) => {
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  async function LogoutHandler() {
    await Logout();
  }

  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const currentPath = pathname.split("/")?.[1];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  function copyToken() {
    navigator.clipboard.writeText(session);
    addToast({
      title: "Session Token",
      description: "Session Token copied to clipboard!",
      color: "success",
      variant: "flat",
    });
  }

  return (
    <HeroUINavbar
      isMenuOpen={isMenuOpen}
      maxWidth="full"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">exFlow</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  {
                    "text-primary font-bold": "/" + currentPath === item.href,
                  },
                  {
                    "font-semibold": "/" + currentPath !== item.href,
                  },
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="primary"
              name={userDetails.username}
              size="sm"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{userDetails.username}</p>
            </DropdownItem>
            {theme === "light" ? (
              <DropdownItem
                key="dark_mode"
                startContent={<Icon icon="hugeicons:moon-01" width={20} />}
                onPress={onChange}
              >
                Dark Mode
              </DropdownItem>
            ) : (
              <DropdownItem
                key="white_mode"
                startContent={<Icon icon="hugeicons:sun-01" width={20} />}
                onPress={onChange}
              >
                White Mode
              </DropdownItem>
            )}
            <DropdownItem
              key="settings"
              startContent={
                <Icon icon="hugeicons:location-user-03" width={20} />
              }
            >
              Profile
            </DropdownItem>
            <DropdownItem
              key="token"
              startContent={<Icon icon="hugeicons:key-02" width={20} />}
              onPress={copyToken}
            >
              Copy Token
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<Icon icon="hugeicons:logout-02" width={20} />}
              onPress={LogoutHandler}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  {
                    "text-primary font-bold": "/" + currentPath === item.href,
                  },
                  {
                    "font-semibold": "/" + currentPath !== item.href,
                  },
                )}
                color="foreground"
                href={item.href}
                onClick={() => {
                  setIsMenuOpen(false);
                }}
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
