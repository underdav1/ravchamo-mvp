"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "../ui/LangProvider";
import { supabase } from "../../lib/supabase";

const TYPES = [
  { value: "restaurant", labelKey: "feedback.typeRestaurant" },
  { value: "feature",    labelKey: "feedback.typeFeature" },
  { value: "bug",        labelKey: "feedback.typeBug" },
  { value: "other",      labelKey: "feedback.typeOther" },
];

export default function FeedbackPage() {
  const { lang, t } = useLang();

  const [type, setType]       = useState("restaurant");
  const [message, setMessage] = useState("");
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState("idle"); // idle | sending | success | error

  // Form is valid when there's a non-trivial message. Email is optional, but
  // if filled it must look like an email — bare minimum: has an @.
  const trimmed = message.trim();
  const emailOk = email === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const canSubmit = trimmed.length > 0 && emailOk && status !== "sending";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("sending");

    const payload = {
      type,
      message: trimmed,
      email: email.trim() || null,
      lang,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    };

    const { error } = await supabase.from("feedback").insert(payload);

    if (error) {
      // Don't surface the raw Postgres error to users — log to console so it's
      // visible in Vercel logs / browser devtools if we ever need to diagnose.
      console.error("feedback insert failed:", error);
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  function reset() {
    setType("restaurant");
    setMessage("");
    setEmail("");
    setStatus("idle");
  }

  // Success state — replaces the form entirely.
  if (status === "success") {
    return (
      <main>
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold">{t("feedback.successTitle")}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("feedback.successBody")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="kahoot-gray text-center py-3 rounded-2xl font-semibold"
          >
            {t("feedback.sendAnother")}
          </button>
          <Link
            href="/"
            className="kahoot-mint text-center py-3 rounded-2xl font-semibold"
          >
            {t("feedback.backHome")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">{t("feedback.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t("feedback.intro")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
        {/* Type — native select so it behaves correctly on mobile (iOS uses
            the system picker which is much nicer than a custom dropdown). */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">{t("feedback.typeLabel")}</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border px-3 py-3 bg-white dark:bg-gray-900
                       border-gray-200 dark:border-gray-800 text-base"
          >
            {TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </label>

        {/* Message — autoFocus so users can start typing immediately. Six rows
            is enough to feel like a real text area without dominating the
            screen on mobile. maxLength matches the DB constraint. */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">{t("feedback.messageLabel")}</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("feedback.messagePlaceholder")}
            rows={6}
            maxLength={5000}
            required
            className="rounded-xl border px-3 py-3 bg-white dark:bg-gray-900
                       border-gray-200 dark:border-gray-800 text-base resize-y"
          />
        </label>

        {/* Email — inputMode="email" surfaces the email-optimized keyboard on
            mobile (the @ key is visible). type="email" gives free browser
            validation in addition to our own emailOk check. */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">{t("feedback.emailLabel")}</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("feedback.emailPlaceholder")}
            maxLength={200}
            className="rounded-xl border px-3 py-3 bg-white dark:bg-gray-900
                       border-gray-200 dark:border-gray-800 text-base"
          />
        </label>

        {status === "error" && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {t("feedback.errorBody")}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`kahoot-purple py-3 rounded-2xl font-semibold ${
            !canSubmit ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          {status === "sending" ? t("feedback.submitting") : t("feedback.submit")}
        </button>
      </form>

      <div className="mt-10">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ← {t("feedback.backHome")}
        </Link>
      </div>
    </main>
  );
}
