import type { Metadata } from "next";
import { FaqPage } from "@/components/pages/FaqPage";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about working with Techstar — service scope, project sizing, deployment timelines, cybersecurity, and life-safety compliance.",
  alternates: { canonical: "/faq" },
};

export default function Page() {
  return <FaqPage />;
}
