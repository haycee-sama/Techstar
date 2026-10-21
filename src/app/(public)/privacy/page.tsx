import type { Metadata } from "next";
import { PrivacyPage } from "@/components/pages/PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notice — Techstar (sample policy for proposal purposes).",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <PrivacyPage />;
}
