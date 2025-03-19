import { Execution } from "@/components/execution/execution";
import ErrorCard from "@/components/error/ErrorCard";
import GetExecution from "@/lib/fetch/executions/execution";
import GetFlow from "@/lib/fetch/flow/flow";
import PageGetSettings from "@/lib/fetch/page/settings";
import GetProjectRunners from "@/lib/fetch/project/runners";
import GetUserDetails from "@/lib/fetch/user/getDetails";

export default async function DashboardExecutionPage({
  params,
}: {
  params: Promise<{ id: string; executionID: string }>;
}) {
  const { id, executionID } = await params;

  const flowData = GetFlow(id);
  const executionData = GetExecution(executionID);
  const settingsData = PageGetSettings();
  const userDetailsData = GetUserDetails();

  const [flow, execution, settings, userDetails] = (await Promise.all([
    flowData,
    executionData,
    settingsData,
    userDetailsData,
  ])) as any;

  let runnersData;

  if (flow.success) {
    runnersData = GetProjectRunners(flow.data.flow.project_id);
  }
  const runners = await runnersData;

  return (
    <>
      {execution.success &&
      flow.success &&
      runners.success &&
      settings.success &&
      userDetails.success ? (
        <Execution
          execution={execution.data.execution}
          flow={flow.data.flow}
          runners={runners.data.runners}
          settings={settings.data.settings}
          userDetails={userDetails.data.user}
        />
      ) : (
        <ErrorCard
          error={
            execution.error ||
            flow.error ||
            runners.error ||
            settings.error ||
            userDetails.error
          }
          message={
            execution.message ||
            flow.message ||
            runners.message ||
            settings.message ||
            userDetails.message
          }
        />
      )}
    </>
  );
}
