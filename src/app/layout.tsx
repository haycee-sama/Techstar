import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ContentStoreProvider } from "@/lib/content-store";
import { AppRouter } from "@/lib/router";
import { HashRedirect } from "@/components/site/HashRedirect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://techstar.example"),
  title: {
    default: "Techstar — Security. Infrastructure. Intelligence.",
    template: "%s — Techstar",
  },
  description:
    "Techstar designs, deploys, and operates integrated security, networking, and life-safety systems for organizations that take protection seriously.",
  keywords: [
    "Techstar",
    "integrated security",
    "video surveillance",
    "CCTV",
    "access control",
    "cybersecurity",
    "network infrastructure",
    "fire alarm",
    "life safety",
    "smart buildings",
  ],
  authors: [{ name: "Techstar" }],
  applicationName: "Techstar",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "Techstar",
    title: "Techstar — Security. Infrastructure. Intelligence.",
    description:
      "Integrated security, networking, and life-safety systems engineered as one program.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Techstar — Security. Infrastructure. Intelligence.",
    description:
      "Integrated security, networking, and life-safety systems engineered as one program.",
  },
  icons: {
    icon: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#060A14" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          themes={["light", "dark", "system"]}
          enableSystem
          disableTransitionOnChange
        >
          <ContentStoreProvider>
            <AppRouter>
              <HashRedirect />
              {children}
              <Sonner position="bottom-right" />
            </AppRouter>
          </ContentStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
