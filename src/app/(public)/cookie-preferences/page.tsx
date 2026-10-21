import type { Metadata } from "next";
import { CookiePreferencesPage } from "@/components/pages/CookiePreferencesPage";

export const metadata: Metadata = {
  title: "Cookie Preferences",
  description: "Cookie preferences — Techstar (demo). Manage your analytics, marketing, and functional cookie consent.",
  alternates: { canonical: "/cookie-preferences" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <CookiePreferencesPage />;
}
