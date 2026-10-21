import type { Metadata } from "next";
import { ServicesIndexPage } from "@/components/pages/ServicesIndexPage";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Eight service domains covering CCTV surveillance, network infrastructure, fire alarm, cybersecurity, access control, intrusion detection, smart buildings, and managed IT — engineered as one program.",
  alternates: { canonical: "/services" },
};

export default function Page() {
  return <ServicesIndexPage />;
}
