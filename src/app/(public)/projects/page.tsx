import type { Metadata } from "next";
import { ProjectsIndexPage } from "@/components/pages/ProjectsIndexPage";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected Techstar project case studies — illustrative demonstrations of integrated security, networking, and life-safety deployments across corporate, healthcare, logistics, and residential facilities.",
  alternates: { canonical: "/projects" },
};

export default function Page() {
  return <ProjectsIndexPage />;
}
