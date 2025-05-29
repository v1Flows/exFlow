import ErrorCard from "@/components/error/ErrorCard";
import GetFlows from "@/lib/fetch/flow/all";
import GetRunners from "@/lib/fetch/runner/get";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import GetUserStats from "@/lib/fetch/user/stats";
import DashboardHome from "@/components/dashboard/home";
import GetExecutionsWithAttention from "@/lib/fetch/executions/attention";

export default async function DashboardHomePage() {
  const statsData = GetUserStats();
  const flowsData = GetFlows();
  const runnersData = GetRunners();
  const executionsData = GetExecutionsWithAttention();
  const userData = GetUserDetails();

  const [stats, flows, runners, executions, user] = (await Promise.all([
    statsData,
    flowsData,
    runnersData,
    executionsData,
    userData,
  ])) as any;

  return (
    <>
      {executions.success &&
      flows.success &&
      runners.success &&
      stats.success &&
      user.success ? (
        <DashboardHome
          executionsWithAttention={executions.data.executions}
          flows={flows.data.flows}
          runners={runners.data.runners}
          stats={stats.data.stats}
          user={user.data.user}
        />
      ) : (
        <ErrorCard
          error={
            executions.error ||
            flows.error ||
            runners.error ||
            stats.error ||
            user.error
          }
          message={
            executions.message ||
            flows.message ||
            runners.message ||
            stats.message ||
            user.message
          }
        />
      )}
    </>
  );
}
