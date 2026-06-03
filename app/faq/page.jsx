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
      "The recommendation engine handles it in a few distinct layers under the hood. Layer 1 — The Radius Filter (Location): the app grabs the user's location coordinates to map out what's actually close by and filters out anything too far away to deliver. Layer 2 — Social Proof (App Reviews + Google reviews): once it has a pool of nearby spots, it pulls in review data from major food delivery apps and Google Maps altogether; restaurants with higher ratings get a natural boost. Layer 3 — The \"Secret Sauce\" Model (Price, Craving, Mood): this is where the proprietary algorithm kicks in — it scores each restaurant based on how well it matches the user's specific filters, balancing budget, exact cravings, and current vibe to calculate a personalized relevance score. Layer 4 — The \"Anti-Boredom\" Spice (Randomization): a bit of randomizing logic ensures that even with the exact same filters two days in a row, results stay shuffled and fresh. TL;DR: location finds it, reviews vet it, a custom scoring model matches it to your exact mood and wallet, and a dash of randomness keeps you from eating the same dish every day.",
    answerHtml: (
      <>
        <p className="mb-3">
          Basically, the recommendation engine handles it in a few distinct
          layers under the hood. Here is the breakdown of how a user actually
          gets their food choices:
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 1: The Radius Filter (Location)
        </h3>
        <p className="mb-3">
          First up is pure proximity. The app grabs the user&apos;s location
          coordinates to map out what&apos;s actually close by and filters out
          anything too far away to deliver.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 2: Social Proof (App Reviews + Google reviews)
        </h3>
        <p className="mb-3">
          Once it has a pool of nearby spots, it pulls in review data from major
          food delivery apps and Google Maps altogether. Restaurants with higher
          ratings get a natural boost in the rankings.
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 3: The &quot;Secret Sauce&quot; Model (Price, Craving, Mood)
        </h3>
        <p className="mb-3">
          This is where the proprietary algorithm kicks in. It scores each
          restaurant based on how well it matches the user&apos;s specific
          filters — we&apos;re balancing their budget, exact cravings, and
          current vibe/mood to calculate a personalized relevance score (as well
          as location).
        </p>

        <h3 className="font-semibold mt-4 mb-1">
          Layer 4: The &quot;Anti-Boredom&quot; Spice (Randomization)
        </h3>
        <p className="mb-3">
          To stop the feed from feeling stale, we&apos;ve injected a bit of
          randomizing logic. This ensures that even if someone inputs the exact
          same filters two days in a row, they&apos;ll see a slightly shuffled,
          fresh mix of results instead of the exact same loop.
        </p>

        <p className="mb-1 mt-4">
          <strong>TL;DR:</strong> Location finds it, reviews vet it, a custom
          scoring model matches it to your exact mood/wallet, and a dash of
          randomness keeps you from eating the same dish every single day.
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
