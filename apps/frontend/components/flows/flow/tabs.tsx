"use client";
import { Icon } from "@iconify/react";
import { Tabs } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

import Executions from "@/components/executions/executions";
import Alerts from "@/components/alerts/alerts";

import Actions from "./actions";
import FlowStats from "./stats";
import FlowSettings from "./settings";
import FlowInfo from "./info";
import FlowFailurePipelines from "./failure-pipelines";
import FlowInputParams from "./input-params";

export default function FlowTabs({
  projects,
  flows,
  flow,
  runners,
  user,
  members,
  settings,
}: any) {
  const [selected, setSelected] = React.useState("executions");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  React.useEffect(() => {
    const tab = params.get("tab") || "executions";

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
          selectedKey={selected}
          variant={"secondary"}
          onSelectionChange={handleTabChange}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label={"Options"}>
              <Tabs.Tab id={"executions"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon height={20} icon="hugeicons:rocket-02" width="20" />
                    <span>Executions</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id={"actions"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon
                      height={20}
                      icon="hugeicons:structure-04"
                      width="20"
                    />
                    <span>Actions</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              {!flow.use_dag && (
                <Tabs.Tab id={"failure-pipelines"}>
                  {
                    <div className="flex items-center space-x-2">
                      <Icon
                        height={20}
                        icon="hugeicons:structure-fail"
                        width="20"
                      />
                      <span>Failure Pipelines</span>
                    </div>
                  }
                  <Tabs.Indicator />
                </Tabs.Tab>
              )}
              {flow.type === "alert" && (
                <Tabs.Tab id={"alerts"}>
                  {
                    <div className="flex items-center space-x-2">
                      <Icon height={20} icon="hugeicons:alert-02" width="20" />
                      <span>Alerts</span>
                    </div>
                  }
                  <Tabs.Indicator />
                </Tabs.Tab>
              )}
              <Tabs.Tab id={"info"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:information-square" width={20} />
                    <span>Info</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id={"input-params"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:form-01" width={20} />
                    <span>Input Parameters</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id={"settings"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:settings-02" width={20} />
                    <span>Settings</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id={"executions"}>
            <Executions
              canEdit={checkUserCanEdit()}
              flowID={flow.id}
              runners={runners}
            />
          </Tabs.Panel>
          <Tabs.Panel id={"actions"}>
            <Actions
              canEdit={checkUserCanEdit()}
              flow={flow}
              flows={flows}
              projects={projects}
              runners={runners}
              settings={settings}
              user={user}
            />
          </Tabs.Panel>
          {!flow.use_dag && (
            <Tabs.Panel id={"failure-pipelines"}>
              <FlowFailurePipelines
                canEdit={checkUserCanEdit()}
                flow={flow}
                flows={flows}
                projects={projects}
                runners={runners}
                settings={settings}
                user={user}
              />
            </Tabs.Panel>
          )}
          {flow.type === "alert" && (
            <Tabs.Panel id={"alerts"}>
              <Alerts
                canEdit={checkUserCanEdit()}
                flowID={flow.id}
                flows={[flow]}
                runners={runners}
              />
            </Tabs.Panel>
          )}
          <Tabs.Panel id={"info"}>
            <FlowInfo flow={flow} />
            <div aria-hidden className="h-4" />
            <FlowStats flowID={flow.id} />
          </Tabs.Panel>
          <Tabs.Panel id={"input-params"}>
            <FlowInputParams canEdit={checkUserCanEdit()} flow={flow} />
          </Tabs.Panel>
          <Tabs.Panel id={"settings"}>
            <FlowSettings
              canEdit={checkUserCanEdit()}
              flow={flow}
              user={user}
            />
          </Tabs.Panel>
        </Tabs>
      </div>
    </main>
  );
}
