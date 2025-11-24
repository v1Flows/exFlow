"use client";

import { Button, Kbd } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect } from "react";

import { useSearch } from "./search-context";

export default function Search({
  projects,
  flows,
  folders,
  trigger,
}: {
  projects: any;
  flows: any;
  folders: any;
  // eslint-disable-next-line no-undef
  trigger?: React.ReactNode;
}) {
  const { onOpen, setContextData } = useSearch();

  useEffect(() => {
    setContextData({ projects, flows, folders });
  }, [projects, flows, folders, setContextData]);

  if (trigger) {
    return <>{trigger}</>;
  }

  return (
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
  );
}
