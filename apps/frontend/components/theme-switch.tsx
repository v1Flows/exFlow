"use client";

import { FC } from "react";
import { Switch } from "@heroui/react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";

import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
  controlClassName?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  controlClassName,
}) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const onChange = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  const isSelected = theme === "light" || isSSR;

  return (
    <Switch
      aria-label={`Switch to ${isSelected ? "dark" : "light"} mode`}
      className={clsx(
        "cursor-pointer px-px transition-opacity hover:opacity-80",
        className,
      )}
      isSelected={isSelected}
      onChange={onChange}
    >
      <Switch.Control className={controlClassName}>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        {!isSelected || isSSR ? (
          <SunFilledIcon size={22} />
        ) : (
          <MoonFilledIcon size={22} />
        )}
      </Switch.Content>
    </Switch>
  );
};
