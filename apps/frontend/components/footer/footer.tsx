"use client";
import Image from "next/image";

import { Icon } from "@iconify/react";
import { Link } from "@heroui/react";
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
            src={
              theme === "light"
                ? `/images/justflow_logo_full_transparent_dark.png`
                : `/images/justflow_logo_full_transpartent_white.png`
            }
            width={132}
          />
        </div>
        <div aria-hidden className="h-4" />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {navLinks.map((item) => (
            <Link key={item.name} className="text-muted" href={item.href}>
              {item.name}
            </Link>
          ))}
        </div>
        <div aria-hidden className="h-2" />
        <p className="mt-1 text-center text-sm text-muted">
          &copy; 2025 JustLAB. All rights reserved. Version {siteConfig.version}
        </p>
        <p className="mt-1 flex gap-1 text-center text-sm text-muted">
          Made with <Icon icon="hugeicons:love-korean-finger" width={18} /> in
          Germany
        </p>
      </div>
    </footer>
  );
}
