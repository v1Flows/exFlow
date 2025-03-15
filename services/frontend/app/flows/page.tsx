import { Divider } from "@heroui/react";

import FlowList from "@/components/flows/list";
import GetFlows from "@/lib/fetch/flow/all";
import GetFolders from "@/lib/fetch/folder/all";
import FlowsHeading from "@/components/flows/heading";
import GetProjects from "@/lib/fetch/project/all";
import ErrorCard from "@/components/error/ErrorCard";

export default async function FlowsPage() {
  const flowsData = await GetFlows();
  const foldersData = await GetFolders();
  const projectsData = await GetProjects();

  const [flows, folders, projects] = await Promise.all([
    flowsData,
    foldersData,
    projectsData,
  ]);

  return (
    <main>
      {folders.success && projects.success && flows.success ? (
        <>
          <FlowsHeading
            folders={folders.data.folders}
            projects={projects.data.projects}
          />
          <Divider className="mt-4 mb-4" />
          <FlowList flows={flows.data.flows} folders={folders.data.folders} />
        </>
      ) : (
        <ErrorCard
          error={projects.error || flows.error || folders.error}
          message={projects.message || flows.message || folders.message}
        />
      )}
    </main>
  );
}
