import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/pages/ComingSoonPage";

export const metadata: Metadata = {
  title: "Careers",
  description: "Careers at Techstar — full job board, role pages, and application flow arrive in a future phase.",
  alternates: { canonical: "/careers" },
};

export default function Page() {
  return (
    <ComingSoonPage
      title="Careers"
      description="Careers at Techstar — full job board, role pages, and application flow arrive in a future phase. For now, contact us at hello@techstar.example and tell us how you'd like to contribute."
    />
  );
}
