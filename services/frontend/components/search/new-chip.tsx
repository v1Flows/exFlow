"use client";

import { Chip, cn } from "@heroui/react";
import { startsWith } from "lodash";

// eslint-disable-next-line no-undef
type NewChipProps = React.HTMLAttributes<HTMLDivElement>;

// eslint-disable-next-line no-undef
export const NewChip: React.FC<
  NewChipProps & {
    background?: string;
    isBorderGradient?: boolean;
  }
> = ({ isBorderGradient, background = "#050713", className }) => {
  let style = {};
  const linearGradientBg = startsWith(background, "--")
    ? `hsl(var(${background}))`
    : background;

  if (isBorderGradient) {
    style = {
      border: "solid 1px transparent",
      backgroundImage: `linear-gradient(${linearGradientBg}, ${linearGradientBg}), linear-gradient(to right, #F54180, #338EF7)`,
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box",
    };
  }

  return (
    <Chip
      classNames={{
        base: cn(
          "drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-lg backdrop-saturate-150 bg-white/[.15]",
          className,
        ),
        content: "text-foreground",
      }}
      size="sm"
      style={style}
    >
      New
    </Chip>
  );
};

NewChip.displayName = "NewChip";
