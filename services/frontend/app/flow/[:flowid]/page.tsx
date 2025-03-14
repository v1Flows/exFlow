"use client";

import { Button, ButtonGroup } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Icon } from "@iconify/react";

import FlowList from "@/components/flows/list";
import FlowGrid from "@/components/flows/grid";
import { useState } from "react";
import FlowExecutions from "@/components/flow/executions";
import FlowTabs from "@/components/flow/tabs";

export default function AboutPage() {
  const [view, setView] = useState("list");

  return (
    <main>
      <div className="flex flex-cols items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Flow</p>
        <Button
            color="primary"
            variant="solid"
            startContent={<Icon icon="solar:play-linear" width={16} />}
          >
            Execute
          </Button>
      </div>
      <Divider className="mt-4 mb-4" />
      <FlowTabs />
    </main>
  );
}
