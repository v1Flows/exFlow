"use client";

import { Icon } from "@iconify/react";
import { Link, Spacer, Image } from "@heroui/react";
import React from "react";
import { useTheme } from "next-themes";

import { siteConfig } from "@/config/site";

const navLinks = [
  {
    name: "GitHub",
    href: "https://github.com/JustLABv1/justflow",
  },
  {
    name: "Components",
    href: "https://github.com/orgs/JustLABv1/repositories",
  },
];

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="sticky top-[100vh] flex w-full flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 py-12 lg:px-8">
        <div className="flex h-8 items-center justify-center">
          <Image
            alt="Logo"
            height={132}
            radius="none"
            shadow="none"
            src={
              theme === "light"
                ? `/images/justflow_logo_full_transparent_dark.png`
                : `/images/justflow_logo_full_transpartent_white.png`
            }
            width={132}
          />
        </div>
        <Spacer y={4} />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              isExternal
              className="text-default-500"
              href={item.href}
              size="sm"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <Spacer y={2} />
        <p className="mt-1 text-center text-small text-default-400">
          &copy; 2025 JustLAB. All rights reserved. Version {siteConfig.version}
        </p>
        <p className="mt-1 flex gap-1 text-center text-small text-default-400">
          Made with <Icon icon="hugeicons:love-korean-finger" width={18} /> in
          Germany
        </p>
      </div>
    </footer>
  );
}
