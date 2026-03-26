import ServicePageClient from "@/components/selfservice/ServicePageClient";

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ServicePageClient slug={slug} />;
}
