import { Divider, Spacer } from "@heroui/react";

import FlowTabs from "@/components/flows/flow/tabs";
import GetFlow from "@/lib/fetch/flow/flow";
import ErrorCard from "@/components/error/ErrorCard";
import FlowHeading from "@/components/flows/flow/heading";
import FlowDetails from "@/components/flows/flow/details";
import GetProjects from "@/lib/fetch/project/all";
import GetFlowExecutions from "@/lib/fetch/flow/executions";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import GetProjectRunners from "@/lib/fetch/project/runners";
import GetProject from "@/lib/fetch/project/data";
import GetFolders from "@/lib/fetch/folder/all";
import PageGetSettings from "@/lib/fetch/page/settings";
import GetFlows from "@/lib/fetch/flow/all";

export default async function FlowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const flowsData = GetFlows();
  const flowData = GetFlow(id);
  const projectsData = GetProjects();
  const executionsData = GetFlowExecutions(id);
  const userDetailsData = GetUserDetails();
  const foldersData = GetFolders();
  const settingsData = PageGetSettings();

  const [flows, flow, projects, executions, userDetails, folders, settings] =
    (await Promise.all([
      flowsData,
      flowData,
      projectsData,
      executionsData,
      userDetailsData,
      foldersData,
      settingsData,
    ])) as any;

  let runnersData;
  let projectdata;

  if (flow.success) {
    runnersData = GetProjectRunners(flow.data.flow.project_id);
    projectdata = GetProject(flow.data.flow.project_id);
  }

  const [runners, project] = (await Promise.all([
    runnersData,
    projectdata,
  ])) as any;

  return (
    <main>
      {flow.success ? (
        <>
          <FlowHeading
            flow={flow.data.flow}
            folders={folders.data.folders}
            project={project.data.project}
            projects={projects.data.projects}
            settings={settings.data.settings}
            user={userDetails.data.user}
          />
          <Divider className="mt-4 mb-4" />
          <FlowDetails
            flow={flow.data.flow}
            project={project.data.project}
            runners={runners.data.runners}
            totalExecutions={executions.data.total}
          />
          <Spacer y={4} />
          <FlowTabs
            flow={flow.data.flow}
            flows={flows.data.flows}
            members={project.data.project.members}
            projects={projects.data.projects}
            runners={runners.data.runners}
            settings={settings.data.settings}
            user={userDetails.data.user}
          />
        </>
      ) : (
        <ErrorCard error={flow.error} message={flow.message} />
      )}
    </main>
  );
}
