import EditServicePageClient from "@/components/selfservice/EditServicePageClient";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <EditServicePageClient slug={slug} />;
}
