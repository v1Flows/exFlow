import ExecutionPageClient from "@/components/executions/execution-page-client";

export default async function DashboardExecutionPage({
  params,
}: {
  params: Promise<{ id: string; executionID: string }>;
}) {
  const { id, executionID } = await params;

  return <ExecutionPageClient executionId={executionID} flowId={id} />;
}
