"use client";
import { Icon } from "@iconify/react";
import { Tab, Tabs } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

import Executions from "@/components/executions/executions";

import Actions from "./actions";
import FlowStats from "./stats";
import FlowSettings from "./settings";

export default function FlowTabs({
  projects,
  flows,
  flow,
  executions,
  runners,
  user,
  members,
  settings,
}: any) {
  const [selected, setSelected] = React.useState("actions");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  React.useEffect(() => {
    const tab = params.get("tab") || "actions";

    setSelected(tab);
  }, [params]);

  const handleTabChange = (key: any) => {
    params.set("tab", key);
    router.push(`${pathname}?${params.toString()}`);
  };

  function checkUserCanEdit() {
    if (
      members.find((member: any) => member.user_id === user.id)?.role ===
      "Viewer"
    ) {
      return false;
    } else {
      return true;
    }
  }

  return (
    <main>
      <div className="flex w-full flex-col">
        <Tabs
          aria-label="Options"
          color="primary"
          selectedKey={selected}
          variant="solid"
          onSelectionChange={handleTabChange}
        >
          <Tab
            key="actions"
            title={
              <div className="flex items-center space-x-2">
                <Icon height={20} icon="hugeicons:blockchain-06" width="20" />
                <span>Actions</span>
              </div>
            }
          >
            <Actions
              canEdit={checkUserCanEdit()}
              flow={flow}
              flows={flows}
              projects={projects}
              runners={runners}
              settings={settings}
              user={user}
            />
          </Tab>
          <Tab
            key="executions"
            title={
              <div className="flex items-center space-x-2">
                <Icon height={20} icon="hugeicons:rocket-02" width="20" />
                <span>Executions</span>
              </div>
            }
          >
            <Executions
              canEdit={checkUserCanEdit()}
              executions={executions}
              runners={runners}
            />
          </Tab>
          <Tab
            key="stats"
            title={
              <div className="flex items-center space-x-2">
                <Icon
                  height="20"
                  icon="hugeicons:chart-line-data-01"
                  width="20"
                />
                <span>Stats</span>
              </div>
            }
          >
            <FlowStats flowID={flow.id} />
          </Tab>
          <Tab
            key="settings"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="hugeicons:settings-02" width={20} />
                <span>Settings</span>
              </div>
            }
          >
            <FlowSettings
              canEdit={checkUserCanEdit()}
              flow={flow}
              user={user}
            />
          </Tab>
        </Tabs>
      </div>
    </main>
  );
}
