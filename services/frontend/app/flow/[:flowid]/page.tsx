"use client";

import { Divider, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";

import FlowTabs from "@/components/flow/tabs";

export default function AboutPage() {
  const [view, setView] = useState("list");

  return (
    <main>
      <div className="flex flex-cols items-center justify-between gap-2 lg:grid-cols-2">
        <p className="text-2xl font-bold">Flow</p>
        <Button
          color="primary"
          startContent={<Icon icon="solar:play-linear" width={16} />}
          variant="solid"
        >
          Execute
        </Button>
      </div>
      <Divider className="mt-4 mb-4" />
      <FlowTabs />
    </main>
  );
}
