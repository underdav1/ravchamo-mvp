import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getAllSlugs, getPostBySlug } from "../../../lib/posts";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const url = `https://ravchamo.ge/blog/${post.slug}`;
  const image = post.heroImage ? `https://ravchamo.ge${post.heroImage}` : undefined;
  return {
    title: `${post.title} — Ravchamo`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      images: image ? [image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: image ? [image] : [],
    },
  };
}

export default function ReviewPage({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const bodyHtml = marked.parse(post.body || "", {
    mangle: false,
    headerIds: false,
  });

  // Schema.org JSON-LD: Review + Restaurant. This is what makes the page
  // citable by Google rich snippets and LLM-based search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    headline: post.title,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "Ravchamo", url: "https://ravchamo.ge" },
    inLanguage: "en",
    itemReviewed: post.restaurant
      ? {
          "@type": "Restaurant",
          name: post.restaurant.name,
          alternateName: post.restaurant.georgianName || undefined,
          address: post.restaurant.address
            ? {
                "@type": "PostalAddress",
                streetAddress: post.restaurant.address,
                addressLocality: "Tbilisi",
                addressCountry: "GE",
              }
            : undefined,
          geo:
            post.restaurant.lat && post.restaurant.lon
              ? {
                  "@type": "GeoCoordinates",
                  latitude: post.restaurant.lat,
                  longitude: post.restaurant.lon,
                }
              : undefined,
          servesCuisine: post.restaurant.cuisine,
        }
      : undefined,
    reviewRating: post.ratingValue
      ? {
          "@type": "Rating",
          ratingValue: post.ratingValue,
          bestRating: post.ratingScale,
          worstRating: 1,
        }
      : undefined,
    reviewBody: post.description,
    image: post.heroImage ? `https://ravchamo.ge${post.heroImage}` : undefined,
  };

  return (
    <main lang="en" className="max-w-md mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
      >
        ← All reviews
      </Link>

      <article className="mt-3">
        <h1 className="text-3xl font-extrabold leading-tight mt-2">{post.title}</h1>
        {post.restaurant?.name && (
          <div className="mt-2 text-sm text-gray-500">
            {post.restaurant.name}
            {post.restaurant.georgianName ? ` (${post.restaurant.georgianName})` : ""}
            {post.restaurant.district ? ` • ${post.restaurant.district}` : ""}
            {post.date ? ` • ${new Date(post.date).toLocaleDateString("en-GB", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}` : ""}
          </div>
        )}

        {post.heroImage && (
          <img
            src={post.heroImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-2xl border mt-4"
          />
        )}

        <div
          className="blog-body mt-6"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <div className="mt-8 card text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Found this useful? Let Ravchamo decide your next meal.
          </p>
          <Link
            href={post.ravchamoCta || "/"}
            className="kahoot-purple inline-block px-6 py-3 rounded-2xl font-semibold"
          >
            Find a meal nearby →
          </Link>
        </div>
      </article>

      <div className="mt-10">
        <Link
          href="/blog"
          className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ← All reviews
        </Link>
      </div>
    </main>
  );
}
