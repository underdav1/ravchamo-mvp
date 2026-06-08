import { getAllPosts } from "../lib/posts";

const SITE = "https://ravchamo.ge";

export default function sitemap() {
  const staticUrls = [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/feedback`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const postUrls = getAllPosts().map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: p.date ? new Date(p.date) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticUrls, ...postUrls];
}
