import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleEditor slug={decodeURIComponent(slug)} />;
}
