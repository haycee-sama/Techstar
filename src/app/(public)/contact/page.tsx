import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to Techstar about your security, infrastructure, and life-safety program. Request a consultation, send an inquiry, or use the guided wizard to scope your project.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return <ContactPage />;
}
