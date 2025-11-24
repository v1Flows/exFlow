"use client";
import { Icon } from "@iconify/react";
import { Spacer, Tab, Tabs } from "@heroui/react";
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
          aria-label="Options"
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary",
          }}
          color="primary"
          selectedKey={selected}
          variant="underlined"
          onSelectionChange={handleTabChange}
        >
          <Tab
            key="members"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="hugeicons:location-user-02" width={20} />
                <span>Members</span>
              </div>
            }
          >
            <ProjectMembers project={project} settings={settings} user={user} />
          </Tab>
          <Tab
            key="runners"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="hugeicons:ai-brain-04" width={20} />
                <span>Runners</span>
              </div>
            }
          >
            <ProjectRunnerDetails project={project} user={user} />
            <Spacer y={4} />
            <RunnersList
              singleProject
              projects={[project]}
              runners={runners}
              settings={settings}
              user={user}
            />
          </Tab>
          <Tab
            key="predefined-flow-actions"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="hugeicons:structure-folder" width={20} />
                <span>Predefined Flow Actions</span>
              </div>
            }
          >
            <ProjectActions
              canEdit
              project={project}
              runners={runners}
              settings={settings}
              user={user}
            />
          </Tab>
          <Tab
            key="tokens"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="hugeicons:key-02" width={20} />
                <span>Tokens</span>
              </div>
            }
          >
            <ProjectTokens
              project={project}
              settings={settings}
              tokens={tokens}
              user={user}
            />
          </Tab>
          <Tab
            key="audit"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="hugeicons:audit-01" width={20} />
                <span>Audit</span>
              </div>
            }
          >
            <ProjectAuditLogs audit={audit} project={project} user={user} />
          </Tab>
          <Tab
            key="settings"
            title={
              <div className="flex items-center space-x-2">
                <Icon icon="hugeicons:settings-01" width={20} />
                <span>Settings</span>
              </div>
            }
          >
            <ProjectSettings project={project} user={user} />
          </Tab>
        </Tabs>
      </div>
    </main>
  );
}
