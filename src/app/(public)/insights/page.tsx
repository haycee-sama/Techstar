import type { Metadata } from "next";
import { InsightsIndexPage } from "@/components/pages/InsightsIndexPage";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Editorial insights from Techstar's engineering and operations practice — video analytics, structured cabling, cybersecurity hygiene, smart buildings, and life-safety system design.",
  alternates: { canonical: "/insights" },
};

export default function Page() {
  return <InsightsIndexPage />;
}
