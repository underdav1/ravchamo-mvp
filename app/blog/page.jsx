import Link from "next/link";
import { getAllPosts } from "../../lib/posts";

export const metadata = {
  title: "Reviews — Ravchamo",
  description:
    "Honest restaurant and cafe reviews from Tbilisi, written for visitors and locals who want to actually know where to eat.",
  alternates: { canonical: "https://ravchamo.ge/blog" },
  openGraph: {
    title: "Reviews — Ravchamo",
    description:
      "Honest Tbilisi restaurant and cafe reviews — where to eat in Vake, Saburtalo, Old Tbilisi and beyond.",
    url: "https://ravchamo.ge/blog",
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main lang="en">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Reviews</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Honest, dated visits to Tbilisi restaurants and cafés. Written for people who want to actually know where to eat.
        </p>
      </div>

      {posts.length === 0 && (
        <div className="text-gray-500">No reviews yet.</div>
      )}

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block card hover:opacity-90 transition-opacity"
            >
              {post.heroImage && (
                <img
                  src={post.heroImage}
                  alt={post.title}
                  className="w-full h-44 object-cover rounded-xl mb-3 border"
                />
              )}
              <h2 className="text-lg font-semibold leading-snug">
                {post.title}
              </h2>
              {post.restaurant?.name && (
                <div className="text-sm text-gray-500 mt-1">
                  {post.restaurant.name}
                  {post.restaurant.district ? ` • ${post.restaurant.district}` : ""}
                </div>
              )}
              {post.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {post.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ← Back to Ravchamo
        </Link>
      </div>
    </main>
  );
}
