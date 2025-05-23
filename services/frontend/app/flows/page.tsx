import { Divider } from "@heroui/react";

import FlowList from "@/components/flows/list";
import GetFlows from "@/lib/fetch/flow/all";
import GetFolders from "@/lib/fetch/folder/all";
import FlowsHeading from "@/components/flows/heading";
import GetProjects from "@/lib/fetch/project/all";
import GetRunningExecutions from "@/lib/fetch/executions/running";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import ErrorCard from "@/components/error/ErrorCard";
import PageGetSettings from "@/lib/fetch/page/settings";

export default async function FlowsPage() {
  const flowsData = GetFlows();
  const foldersData = GetFolders();
  const projectsData = GetProjects();
  const runningExecutionsData = GetRunningExecutions();
  const userDetailsData = GetUserDetails();
  const settingsData = PageGetSettings();

  const [flows, folders, projects, runningExecutions, userDetails, settings] =
    (await Promise.all([
      flowsData,
      foldersData,
      projectsData,
      runningExecutionsData,
      userDetailsData,
      settingsData,
    ])) as any;

  return (
    <main>
      {projects.success &&
      folders.success &&
      flows.success &&
      userDetails.success &&
      settings.success ? (
        <>
          <FlowsHeading
            folders={folders.data.folders}
            projects={projects.data.projects}
            settings={settings.data.settings}
            user={userDetails.data.user}
          />
          <Divider className="mt-4 mb-4" />
          <FlowList
            flows={flows.data.flows}
            folders={folders.data.folders}
            projects={projects.data.projects}
            runningExecutions={
              runningExecutions.success ? runningExecutions.data : []
            }
            user={userDetails.data.user}
          />
        </>
      ) : (
        <ErrorCard
          error={
            projects.error ||
            folders.error ||
            flows.error ||
            userDetails.error ||
            settings.error
          }
          message={
            projects.message ||
            folders.message ||
            flows.message ||
            userDetails.message ||
            settings.message
          }
        />
      )}
    </main>
  );
}
