import FlowPageClient from "@/components/flows/flow/page-client";

export default async function FlowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <FlowPageClient flowId={id} />;
}
