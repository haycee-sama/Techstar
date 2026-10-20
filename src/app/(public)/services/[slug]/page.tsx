import { ServiceDetailPage } from "@/components/pages/ServiceDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ServiceDetailPage slug={decodeURIComponent(slug)} />;
}
