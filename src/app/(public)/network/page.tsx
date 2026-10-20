"use client";

import dynamic from "next/dynamic";

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
