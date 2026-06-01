import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const REVIEWS_DIR = path.join(process.cwd(), "content", "reviews");

function listFiles() {
  try {
    return fs
      .readdirSync(REVIEWS_DIR)
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  } catch {
    return [];
  }
}

export function getAllPosts() {
  return listFiles()
    .map((filename) => {
      const slug = filename.replace(/\.(md|mdx)$/i, "");
      const file = fs.readFileSync(path.join(REVIEWS_DIR, filename), "utf8");
      const { data } = matter(file);
      return {
        slug: data.slug || slug,
        title: data.title || slug,
        description: data.description || "",
        date: data.date ? new Date(data.date).toISOString() : null,
        heroImage: data.heroImage || null,
        restaurant: data.restaurant || null,
        keywords: data.keywords || [],
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug) {
  const filename = listFiles().find((f) => {
    const fileSlug = f.replace(/\.(md|mdx)$/i, "");
    if (fileSlug === slug) return true;
    // Also match on the explicit `slug:` field inside frontmatter
    try {
      const file = fs.readFileSync(path.join(REVIEWS_DIR, f), "utf8");
      const { data } = matter(file);
      return data.slug === slug;
    } catch {
      return false;
    }
  });
  if (!filename) return null;
  const file = fs.readFileSync(path.join(REVIEWS_DIR, filename), "utf8");
  const { data, content } = matter(file);
  return {
    slug: data.slug || filename.replace(/\.(md|mdx)$/i, ""),
    title: data.title || "",
    description: data.description || "",
    date: data.date ? new Date(data.date).toISOString() : null,
    heroImage: data.heroImage || null,
    images: data.images || [],
    restaurant: data.restaurant || null,
    ratingValue: data.ratingValue || null,
    ratingScale: data.ratingScale || 5,
    keywords: data.keywords || [],
    author: data.author || "Ravchamo",
    ravchamoCta: data.ravchamoCta || "/",
    body: content,
  };
}

export function getAllSlugs() {
  return getAllPosts().map((p) => p.slug);
}
