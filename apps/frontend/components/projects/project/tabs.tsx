"use client";
import { Icon } from "@iconify/react";
import { Tabs } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

import ProjectMembers from "@/components/projects/project/members";
import ProjectTokens from "@/components/projects/project/tables/TokensTable";
import RunnersList from "@/components/runners/list";

import ProjectAuditLogs from "./tables/AuditTable";
import ProjectRunnerDetails from "./RunnerDetails";
import ProjectActions from "./actions";
import ProjectSettings from "./settings";

export default function ProjectTabs({
  project,
  runners,
  tokens,
  settings,
  audit,
  user,
}: any) {
  const [selected, setSelected] = React.useState("members");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  React.useEffect(() => {
    let tab = params.get("tab") || "members";

    setSelected(tab);
  }, [params]);

  const handleTabChange = (key: any) => {
    params.set("tab", key);
    router.push(`${pathname}?${params.toString()}`);
  };

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
              <Tabs.Tab id={"members"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:location-user-02" width={20} />
                    <span>Members</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id={"runners"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:ai-brain-04" width={20} />
                    <span>Runners</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id={"predefined-flow-actions"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:structure-folder" width={20} />
                    <span>Predefined Flow Actions</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id={"tokens"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:key-02" width={20} />
                    <span>Tokens</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id={"audit"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:audit-01" width={20} />
                    <span>Audit</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id={"settings"}>
                {
                  <div className="flex items-center space-x-2">
                    <Icon icon="hugeicons:settings-01" width={20} />
                    <span>Settings</span>
                  </div>
                }
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id={"members"}>
            <ProjectMembers project={project} settings={settings} user={user} />
          </Tabs.Panel>
          <Tabs.Panel id={"runners"}>
            <ProjectRunnerDetails project={project} user={user} />
            <div aria-hidden className="h-4" />
            <RunnersList
              singleProject
              projects={[project]}
              runners={runners}
              settings={settings}
              user={user}
            />
          </Tabs.Panel>
          <Tabs.Panel id={"predefined-flow-actions"}>
            <ProjectActions
              canEdit
              project={project}
              runners={runners}
              settings={settings}
              user={user}
            />
          </Tabs.Panel>
          <Tabs.Panel id={"tokens"}>
            <ProjectTokens
              project={project}
              settings={settings}
              tokens={tokens}
              user={user}
            />
          </Tabs.Panel>
          <Tabs.Panel id={"audit"}>
            <ProjectAuditLogs audit={audit} project={project} user={user} />
          </Tabs.Panel>
          <Tabs.Panel id={"settings"}>
            <ProjectSettings project={project} user={user} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </main>
  );
}
