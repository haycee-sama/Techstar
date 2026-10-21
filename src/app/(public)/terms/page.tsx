import type { Metadata } from "next";
import { TermsPage } from "@/components/pages/TermsPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use — Techstar (sample policy for proposal purposes).",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <TermsPage />;
}
