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
        <p className="text-2xl font-bold">Flow</p>
      </div>
      <Divider className="mt-4 mb-4" />
    </main>
  );
}
