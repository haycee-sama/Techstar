import { IndustryDetailPage } from "@/components/pages/IndustryDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <IndustryDetailPage slug={decodeURIComponent(slug)} />;
}
