import type { Metadata } from "next";
import { ArticleDetailPage } from "@/components/pages/ArticleDetailPage";
import { seedData } from "@/lib/seed-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const article = seedData.articles.find((a) => a.slug === decoded);
  if (!article) {
    return { title: "Article not found", description: "The requested article could not be found." };
  }
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      title: `${article.title} — Techstar`,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArticleDetailPage slug={decodeURIComponent(slug)} />;
}
