import type { Metadata } from "next";
import { AboutPage } from "@/components/pages/AboutPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Techstar — a forward-thinking technology partner helping businesses protect people, infrastructure, data, and operations through integrated security, networking, and life-safety systems.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutPage />;
}
