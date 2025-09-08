"use client";
import { Icon } from "@iconify/react";
import { Spacer, Tab, Tabs } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

import Executions from "@/components/executions/executions";
import Alerts from "@/components/alerts/alerts";

import Actions from "./actions";
import FlowStats from "./stats";
import FlowSettings from "./settings";
import FlowInfo from "./info";
import FlowFailurePipelines from "./failure-pipelines";

export default function FlowTabs({
  projects,
  flows,
  flow,
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
          onSelectionChange={handleTabChange}
        >
          <Tab
            key="actions"
            title={
              <div className="flex items-center space-x-2">
                <Icon height={20} icon="hugeicons:structure-04" width="20" />
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
            key="failure-pipelines"
            title={
              <div className="flex items-center space-x-2">
                <Icon height={20} icon="hugeicons:structure-fail" width="20" />
                <span>Failure Pipelines</span>
              </div>
            }
          >
            <FlowFailurePipelines
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
              flowID={flow.id}
              runners={runners}
            />
          </Tab>

          {flow.type === "alert" && (
            <Tab
              key="alerts"
              title={
                <div className="flex items-center space-x-2">
                  <Icon height={20} icon="hugeicons:alert-02" width="20" />
                  <span>Alerts</span>
                </div>
              }
            >
              <Alerts
                canEdit={checkUserCanEdit()}
                flowID={flow.id}
                flows={[flow]}
                runners={runners}
              />
            </Tab>
          )}

          <Tab
            key="info"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="hugeicons:information-square" width={20} />
                <span>Info</span>
              </div>
            }
          >
            <FlowInfo flow={flow} />
            <Spacer y={4} />
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
