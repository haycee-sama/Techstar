import { LegalEditor } from "@/components/admin/LegalEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <LegalEditor slug={decodeURIComponent(slug)} />;
}
