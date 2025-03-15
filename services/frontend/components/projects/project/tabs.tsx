"use client";
import { Icon } from "@iconify/react";
import { Tab, Tabs } from "@heroui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

import ProjectMembers from "@/components/projects/project/tables/UserTable";
import ProjectTokens from "@/components/projects/project/tables/TokensTable";
import Runners from "@/components/projects/project/Runners";

import ProjectAuditLogs from "./tables/AuditTable";

export default function ProjectTabs({
  project,
  members,
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
          color="primary"
          selectedKey={selected}
          variant="solid"
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
            <ProjectMembers
              members={members}
              project={project}
              settings={settings}
              user={user}
            />
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
            <Runners
              members={members}
              project={project}
              runners={runners}
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
              members={members}
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
            <ProjectAuditLogs audit={audit} members={members} user={user} />
          </Tab>
        </Tabs>
      </div>
    </main>
  );
}
