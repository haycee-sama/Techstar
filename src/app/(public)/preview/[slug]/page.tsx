import type { Metadata } from "next";
import { PreviewPage } from "@/components/pages/PreviewPage";

export const metadata: Metadata = {
  title: "Preview",
  description: "Preview of a builder-edited page (demo).",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PreviewPage slug={decodeURIComponent(slug)} />;
}
