import ErrorCard from "@/components/error/ErrorCard";
import AdminGetFlows from "@/lib/fetch/admin/flows";
import AdminGetExecutions from "@/lib/fetch/admin/executions";
import Executions from "@/components/executions/executionsTable";
import AdminGetRunners from "@/lib/fetch/admin/runners";

export default async function AdminExecutionsPage() {
  const flowsData = await AdminGetFlows();
  const executionsData = await AdminGetExecutions();
  const runnersData = await AdminGetRunners();

  const [flows, executions, runners] = (await Promise.all([
    flowsData,
    executionsData,
    runnersData,
  ])) as any;

  return (
    <main>
      {flows.success ? (
        <>
          <p className="text-2xl font-bold mb-1">
            <span className="text-danger">Admin</span> | Executions
          </p>
          <hr className="my-4 border-default" />
          <Executions
            canEdit
            displayToFlow
            executions={executions.data.executions}
            runners={runners.data.runners}
          />
        </>
      ) : (
        <ErrorCard error={flows.error} message={flows.message} />
      )}
    </main>
  );
}
