import type { Metadata } from "next";
import NetworkGlobeClient from "./NetworkGlobeClient";

export const metadata: Metadata = {
  title: "Network",
  description: "Interactive network globe — Techstar's connected security and infrastructure visualization.",
  alternates: { canonical: "/network" },
};

export default function Page() {
  return <NetworkGlobeClient />;
}
