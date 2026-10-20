import { ServiceEditor } from "@/components/admin/ServiceEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ServiceEditor slug={decodeURIComponent(slug)} />;
}
