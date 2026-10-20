import { ProjectEditor } from "@/components/admin/ProjectEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectEditor slug={decodeURIComponent(slug)} />;
}
