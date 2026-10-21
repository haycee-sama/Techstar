import type { Metadata } from "next";
import { HomePage } from "@/components/pages/HomePage";

export const metadata: Metadata = {
  title: "Security. Infrastructure. Intelligence.",
  description:
    "Techstar designs, deploys, and operates integrated security, networking, and life-safety systems — engineered as one program, documented to the drop, and operated against the worst day of your year.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Techstar — Security. Infrastructure. Intelligence.",
    description:
      "Integrated security, networking, and life-safety systems engineered as one program.",
    type: "website",
  },
};

export default function Page() {
  return <HomePage />;
}
