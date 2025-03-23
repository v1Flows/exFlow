"use client";

import { CircularProgress, Progress } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function Reloader({ circle = false }: { circle?: boolean }) {
  const [value, setValue] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 50));
      if (value === 100) {
        clearInterval(interval);
        router.refresh();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [value]);

  return circle ? (
    <CircularProgress value={value} />
  ) : (
    <Progress
      aria-label="Reloading..."
      className="w-32 lg:w-40"
      size="sm"
      value={value}
    />
  );
}
