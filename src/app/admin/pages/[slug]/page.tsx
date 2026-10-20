import { PageEditor } from "@/components/admin/PageEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PageEditor slug={decodeURIComponent(slug)} />;
}
