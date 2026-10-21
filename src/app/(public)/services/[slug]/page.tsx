import type { Metadata } from "next";
import { ServiceDetailPage } from "@/components/pages/ServiceDetailPage";
import { seedData } from "@/lib/seed-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const service = seedData.services.find((s) => s.slug === decoded);
  if (!service) {
    return { title: "Service not found", description: "The requested service could not be found." };
  }
  return {
    title: service.title,
    description: service.tagline,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.title} — Techstar`,
      description: service.tagline,
      type: "article",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ServiceDetailPage slug={decodeURIComponent(slug)} />;
}
