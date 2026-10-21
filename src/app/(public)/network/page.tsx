import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Network",
  description: "Interactive network globe — Techstar's connected security and infrastructure visualization.",
  alternates: { canonical: "/network" },
};

const NetworkGlobePage = dynamic(
  () => import("@/components/pages/NetworkGlobePage").then((m) => m.NetworkGlobePage),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        style={{ backgroundColor: "var(--bg-deep)" }}
      >
        <div className="eyebrow">Loading network globe…</div>
      </div>
    ),
  }
);

export default function Page() {
  return <NetworkGlobePage />;
}
