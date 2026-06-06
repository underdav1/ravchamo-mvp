import Link from "next/link";

export const metadata = {
  title: "FAQ — Ravchamo",
  description:
    "How Ravchamo recommends dishes in Tbilisi — the ranking logic, the data behind it, and answers to the most common questions.",
  alternates: { canonical: "https://ravchamo.ge/faq" },
  openGraph: {
    title: "FAQ — Ravchamo",
    description:
      "How Ravchamo recommends dishes in Tbilisi — the ranking logic, the data, and the most common questions.",
    url: "https://ravchamo.ge/faq",
    type: "website",
  },
};

// Single source of truth for the FAQ entries. To add a new question, just
// append an object here. `answerHtml` is rendered as-is so we can include
// paragraph breaks; `answerText` is the plain version fed to JSON-LD (Google's
// FAQPage schema wants a plain string, no HTML markup that affects layout).
const FAQ = [
  {
    id: "how-are-dishes-ranked",
    question: "How are dishes ranked?",
    answerText:
      "The recommendation engine works in six layers. Layer 1 — Quality cut: we drop low-rated restaurants entirely. Every restaurant gets a single quality score from 0 to 10 combining Google reviews and Wolt ratings (with a statistical correction so a place with only a handful of reviews doesn't get artificially boosted). Anything below 7.5 is excluded from the pool before scoring even starts. Layer 2 — Mood match: the heaviest signal. Picking one mood softly prefers dishes that match it; picking two requires at least one match and weights the first mood more than the second. Layer 3 — Restaurant rating: the quality score from Layer 1 also feeds into the final ranking. Better restaurants float to the top. Layer 4 — Distance: a soft preference, not a filter. Closer dishes get a small boost (a place 3 km away is preferred over one 6 km away, but neither is excluded). Layer 5 — Variety cap: we keep only the top two dishes per restaurant so one place doesn't dominate your results. Layer 6 — Randomness: a deliberate jitter is added so two searches with the exact same filters won't return identical results. \"I'm feeling lucky\" turns this up even higher for genuine surprise. TL;DR: bad restaurants are filtered out, mood is the biggest factor, rating and distance refine the order, and randomness keeps things fresh.",
    answerHtml: (
      <>
        <p className="mb-3">
          The recommendation engine handles every search in six layers. Here is
          how a dish actually ends up at the top of your results:
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 1: Quality cut
        </h3>
        <p className="mb-3">
          Before anything else, we drop low-rated restaurants entirely. Every
          restaurant gets a single quality score from 0–10 combining Google
          reviews and Wolt ratings — with a statistical correction so a place
          with only a handful of reviews doesn&apos;t get artificially boosted
          by one or two enthusiastic posts. Anything scoring below 7.5 is
          excluded from the pool before scoring even starts.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 2: Mood match (the biggest signal)
        </h3>
        <p className="mb-3">
          This is the dominant factor. Pick one mood and the engine softly
          prefers dishes that match it. Pick two and at least one must match —
          with the first mood you tapped weighted more heavily than the second.
          Mood matching counts for roughly 75% of the score.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 3: Restaurant rating
        </h3>
        <p className="mb-3">
          The quality score from Layer 1 also feeds into the final ranking — not
          just as a filter. Better-rated restaurants get a meaningful boost in
          ordering. Counts for roughly 25% of the score.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 4: Distance (a soft preference)
        </h3>
        <p className="mb-3">
          Distance is a tilt, not a filter. A restaurant 3 km away is preferred
          over one 6 km away, but neither gets excluded. The reasoning: you
          probably don&apos;t want to walk across town for lunch, but a great
          spot 4 km away is still worth knowing about. Counts for roughly 15%
          of the score.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 5: Restaurant variety cap
        </h3>
        <p className="mb-3">
          We keep only the top two dishes per restaurant. Without this rule, a
          place with 80 menu items would crowd out everyone else. The cap means
          your results show ten dishes from at least five different restaurants.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 6: A dash of randomness
        </h3>
        <p className="mb-3">
          A deliberate jitter is added to the final score so two searches with
          the exact same filters won&apos;t return identical results. Tapping
          &quot;I&apos;m feeling lucky&quot; turns this up further for genuine
          surprise.
        </p>

        <p className="mb-1 mt-4">
          <strong>TL;DR:</strong> Bad restaurants are filtered out, mood is the
          biggest factor, rating and distance refine the order, and randomness
          keeps things fresh.
        </p>
      </>
    ),
  },
];

// Google's FAQPage schema — gives us the chance at "rich result" snippets in
// search, and is the same shape LLMs (ChatGPT, Perplexity, Claude) cite from
// when answering "how does Ravchamo rank dishes?". Keep answers plain text.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answerText,
    },
  })),
};

export default function FAQPage() {
  return (
    <main lang="en">
      <script
        type="application/ld+json"
        // Schema markup for Google + LLM citation. Stringified once at build
        // time; no runtime cost.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">FAQ</h1>
        <p className="text-gray-600 dark:text-gray-400">
          How Ravchamo works under the hood — and the questions people ask most.
        </p>
      </div>

      <div className="space-y-6">
        {FAQ.map((item) => (
          <article key={item.id} id={item.id} className="card">
            <h2 className="text-xl font-semibold leading-snug mb-3">
              {item.question}
            </h2>
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {item.answerHtml}
            </div>
          </article>
        ))}
      </div>

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
