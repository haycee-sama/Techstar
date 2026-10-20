import { VisualBuilder } from "@/components/admin/VisualBuilder";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <VisualBuilder slug={decodeURIComponent(slug)} />;
}
