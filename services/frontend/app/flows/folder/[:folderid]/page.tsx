"use client";

import { Button, ButtonGroup } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";

import FlowList from "@/components/dashboard/flows/list";
import FlowGrid from "@/components/dashboard/flows/grid";
import { useState } from "react";

export default function AboutPage() {
  const [view, setView] = useState("list");

  return (
    <main>
      <div className="grid grid-cols-2 items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Folder 1</p>
        <div className="flex flex-cols justify-end gap-2">
          <ButtonGroup radius="md" variant="ghost">
            <Button isIconOnly onPress={() => setView("grid")} color={view === "grid" ? "primary" : "default"}>
              <Icon icon="line-md:grid-3-filled" width={16} />
            </Button>
            <Button isIconOnly color={view === "list" ? "primary" : "default"} onPress={() => setView("list")}>
              <Icon icon="line-md:list-3-filled" width={16} />
            </Button>
          </ButtonGroup>

          <Button isIconOnly variant="ghost">
            <Icon icon="line-md:filter" width={16} />
          </Button>

          <Divider className="h-10 mr-2 ml-2" orientation="vertical" />

          <Button
            color="primary"
            startContent={<Icon icon="solar:book-2-outline" width={16} />}
          >
            Create Flow
          </Button>
          <Button
            color="primary"
            startContent={
              <Icon icon="solar:folder-with-files-outline" width={16} />
            }
            variant="flat"
          >
            Create Subfolder
          </Button>
        </div>
      </div>
      <Divider className="mt-4 mb-4" />
      {view === "list" ? <FlowList /> : <FlowGrid />}
    </main>
  );
}
