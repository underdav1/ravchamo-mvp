import { Suspense } from "react";
import ResultsClient from "./ResultsClient";

export default function ResultsPage() {
  return (
    <Suspense fallback={<main className="p-4">Loading results…</main>}>
      <ResultsClient />
    </Suspense>
  );
}
