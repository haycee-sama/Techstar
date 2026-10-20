import { ProjectDetailPage } from "@/components/pages/ProjectDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectDetailPage slug={decodeURIComponent(slug)} />;
}
