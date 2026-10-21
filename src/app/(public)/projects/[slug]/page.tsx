import type { Metadata } from "next";
import { ProjectDetailPage } from "@/components/pages/ProjectDetailPage";
import { seedData } from "@/lib/seed-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const project = seedData.projects.find((p) => p.slug === decoded);
  if (!project) {
    return { title: "Project not found", description: "The requested case study could not be found." };
  }
  return {
    title: `${project.title} — Case Study`,
    description: `${project.title} — ${project.client} (${project.location}). ${project.challenge?.slice(0, 120) || ""}`,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} — Techstar`,
      description: `${project.client} (${project.location}) — illustrative case study.`,
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
  return <ProjectDetailPage slug={decodeURIComponent(slug)} />;
}
