import { PreviewPage } from "@/components/pages/PreviewPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PreviewPage slug={decodeURIComponent(slug)} />;
}
