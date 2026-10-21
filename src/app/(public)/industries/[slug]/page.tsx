import type { Metadata } from "next";
import { IndustryDetailPage } from "@/components/pages/IndustryDetailPage";
import { seedData } from "@/lib/seed-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const industry = seedData.industries.find((i) => i.slug === decoded);
  if (!industry) {
    return { title: "Industry not found", description: "The requested industry could not be found." };
  }
  return {
    title: `${industry.name} — Industry`,
    description: `${industry.name} solutions from Techstar — ${industry.tagline || "integrated security and infrastructure."}`,
    alternates: { canonical: `/industries/${industry.slug}` },
    openGraph: {
      title: `${industry.name} — Techstar`,
      description: industry.tagline || "Integrated security and infrastructure.",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <IndustryDetailPage slug={decodeURIComponent(slug)} />;
}
