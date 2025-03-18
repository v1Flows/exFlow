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

export default async function FlowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const flowData = await GetFlow(id);
  const projectsData = await GetProjects();
  const executionsData = GetFlowExecutions(id);
  const userDetailsData = GetUserDetails();

  const [flow, projects, executions, userDetails] = (await Promise.all([
    flowData,
    projectsData,
    executionsData,
    userDetailsData,
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
          <FlowHeading flow={flow.data.flow} />
          <Divider className="mt-4 mb-4" />
          <FlowDetails
            executions={executions.data.executions}
            flow={flow.data.flow}
            project={
              projects.success
                ? projects.data.projects.find(
                    (project: any) => project.id === flow.data.flow.project_id,
                  )
                : null
            }
          />
          <Spacer y={4} />
          <FlowTabs
            executions={executions.data.executions}
            flow={flow.data.flow}
            members={project.data.members}
            runners={runners.data.runners}
            user={userDetails.data.user}
          />
        </>
      ) : (
        <ErrorCard error={flow.error} message={flow.message} />
      )}
    </main>
  );
}
