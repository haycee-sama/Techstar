import type { Metadata } from "next";
import { IndustriesIndexPage } from "@/components/pages/IndustriesIndexPage";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Techstar serves corporate offices, healthcare, education, hospitality, industrial, retail, residential, and public-sector organizations with tailored security and infrastructure programs.",
  alternates: { canonical: "/industries" },
};

export default function Page() {
  return <IndustriesIndexPage />;
}
