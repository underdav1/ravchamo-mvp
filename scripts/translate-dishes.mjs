#!/usr/bin/env node
/**
 * One-shot Georgian → English translator for the dishes table.
 *
 * Reads every dish where `name_en is null`, sends batches to OpenAI, writes the
 * results back into Supabase. Idempotent and resumable — kill it and re-run; it
 * picks up wherever it left off because it always reads "WHERE name_en IS NULL".
 *
 * Usage:
 *   cd ravchamo-mvp
 *   npm install                            # if you haven't already
 *   export SUPABASE_URL="https://mmyxzagdcwnjjoowufiu.supabase.co"
 *   export SUPABASE_SECRET="sb_secret_..."   # NEW secret key, NOT the publishable one
 *   export OPENAI_KEY="sk-proj-..."
 *   node scripts/translate-dishes.mjs
 *
 * Optional env vars:
 *   MODEL          default "gpt-4o-mini"  (cheap, plenty good for this)
 *   BATCH_SIZE     default 40             (rows per OpenAI call)
 *   CONCURRENCY    default 3              (parallel OpenAI calls)
 *   DRY_RUN        if "1", show first 5 translations, don't write
 *
 * Costs: ~$1–3 with gpt-4o-mini for ~28k names + ~17k descriptions.
 * Runtime: ~10–15 min on a typical home connection.
 */

import { createClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET = process.env.SUPABASE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY || process.env.OPENAI_API_KEY;
const MODEL = process.env.MODEL || "gpt-4o-mini";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "40", 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "3", 10);
const DRY_RUN = process.env.DRY_RUN === "1";

if (!SUPABASE_URL || !SUPABASE_SECRET || !OPENAI_KEY) {
  console.error(
    "Missing env vars. Set SUPABASE_URL, SUPABASE_SECRET, and OPENAI_KEY before running.\n" +
      "Example:\n" +
      '  export SUPABASE_URL="https://mmyxzagdcwnjjoowufiu.supabase.co"\n' +
      '  export SUPABASE_SECRET="sb_secret_..."\n' +
      '  export OPENAI_KEY="sk-proj-..."\n'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ────────────────────────────────────────────────────────────────────────────
// Prompt
// ────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are translating Georgian restaurant menu items to natural English for tourists visiting Tbilisi. Your output will be ingested by an automated pipeline so it MUST be valid JSON exactly matching the schema described below — no markdown, no commentary, no code fences.

INPUT: an array of objects, each {id, name, description}. Name and description may be in Georgian script, English, Russian transliteration, or a mix. Description may be null.

OUTPUT: an object {"items": [...]} where each item is {id, name_en, description_en}.

RULES:

1. Natural English, not literal. "ქათმის წვნიანი" → "Chicken soup", not "Chicken-of soup".

2. Famous Georgian dishes — preserve transliteration + add short parenthetical for tourists:
   - ხინკალი → "Khinkali (Georgian dumplings)"
   - ხაჭაპური → "Khachapuri (cheese bread)"
   - ხაჭაპური აჭარული → "Adjarian Khachapuri (boat-shaped with egg and cheese)"
   - მწვადი → "Mtsvadi (Georgian skewered meat)"
   - ხარჩო / სუპ-ხარჩო → "Kharcho (spicy Georgian beef soup)"
   - ლობიო → "Lobio (Georgian bean stew)"
   - ფხალი → "Pkhali (vegetable pâté)"
   - ჩაქაფული → "Chakapuli (lamb and tarragon stew)"
   - ჩახოხბილი → "Chakhokhbili (chicken stew)"
   - ოჯახური → "Ojakhuri (family-style pork)"
   - ხაშლამა → "Khashlama (boiled meat)"
   - კუბდარი → "Kubdari (Svan meat-stuffed bread)"

3. Russian/Soviet-era dishes — use the English spelling tourists know:
   - ბორში → "Borsch"
   - პელმენი → "Pelmeni (Russian dumplings)"
   - ოლივიე → "Olivier salad"
   - სელიოდკა → "Salted herring"
   - კვაში → "Kvass"
   - ოკროშკა → "Okroshka (cold kefir soup)"
   - ვარენიკები → "Vareniki (filled dumplings)"

4. DROP from names and descriptions:
   - Prices ("26,00 ₾", "GEL 15.00")
   - Weights ("350 გ", "250g", "250 ml")
   - Hashtags, emoji, asterisks, repeated punctuation
   - Item codes ("X 75", "N 2")
   - KEEP piece counts when meaningful menu info, e.g. "Khinkali x10".

5. Ingredient-list descriptions ("ცხვრის ფარში, ხახვი, მჟავე") → clean comma-separated English: "lamb mince, onion, pickled vegetables".

6. If a name is already English (no Georgian script), copy it to name_en unchanged.

7. If description is null or empty, output description_en as null.

8. Max 60 chars for name_en, max 200 for description_en. Trim aggressively.

9. Do not invent ingredients. If unsure, transliterate and append "(Georgian dish)".

10. Every input id MUST appear in the output items array, in the same order.`;

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

async function fetchUntranslated(limit) {
  const { data, error } = await supabase
    .from("dishes")
    .select("id, name, description")
    .is("name_en", null)
    .order("id")
    .limit(limit);
  if (error) throw new Error(`Supabase fetch: ${error.message}`);
  return data || [];
}

async function countRemaining() {
  const { count, error } = await supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .is("name_en", null);
  if (error) throw new Error(`Supabase count: ${error.message}`);
  return count || 0;
}

async function translateBatch(rows) {
  const body = JSON.stringify({
    model: MODEL,
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(rows) },
    ],
  });
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");
  const parsed = JSON.parse(content);
  const items = parsed.items || parsed.translations || parsed;
  if (!Array.isArray(items)) throw new Error("Translation response is not an array");
  return items;
}

async function applyUpdates(items) {
  // Single-row UPDATEs in parallel — PostgREST handles this fine for ~50 at a time.
  const tasks = items
    .filter((it) => it && Number.isFinite(Number(it.id)))
    .map(async (it) => {
      const id = Number(it.id);
      const name_en = clip(it.name_en, 60);
      const description_en = clip(it.description_en, 200);
      const { error } = await supabase
        .from("dishes")
        .update({ name_en, description_en })
        .eq("id", id);
      if (error) {
        // Don't blow up the whole batch on a single failure
        console.warn(`  ! update ${id} failed: ${error.message}`);
        return false;
      }
      return true;
    });
  const results = await Promise.all(tasks);
  return results.filter(Boolean).length;
}

function clip(s, max) {
  if (s == null) return null;
  const str = String(s).trim();
  if (!str) return null;
  return str.length > max ? str.slice(0, max).trim() : str;
}

// Lightweight concurrency-limited mapper
async function mapWithConcurrency(items, n, fn) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      try {
        out[idx] = await fn(items[idx], idx);
      } catch (err) {
        console.warn(`  ! batch ${idx} failed: ${err.message}`);
        out[idx] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m${s % 60}s` : `${s}s`;
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  const start = Date.now();
  const remaining = await countRemaining();
  console.log(`Untranslated dishes: ${remaining}`);
  console.log(
    `Config: model=${MODEL} batch=${BATCH_SIZE} concurrency=${CONCURRENCY} dry_run=${DRY_RUN}`
  );

  if (remaining === 0) {
    console.log("Nothing to do. Exiting.");
    return;
  }

  if (DRY_RUN) {
    const sample = await fetchUntranslated(5);
    console.log("\nDRY_RUN — translating first 5 rows only:\n");
    const translations = await translateBatch(sample);
    console.log(JSON.stringify(translations, null, 2));
    console.log("\nDRY_RUN done — no writes performed.");
    return;
  }

  let totalDone = 0;
  let totalAttempted = 0;
  let pageNum = 0;

  while (true) {
    pageNum++;

    // Fetch enough rows to feed all concurrent OpenAI calls for this page
    const pageSize = BATCH_SIZE * CONCURRENCY;
    const rows = await fetchUntranslated(pageSize);
    if (rows.length === 0) break;

    // Split into BATCH_SIZE chunks
    const batches = [];
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      batches.push(rows.slice(i, i + BATCH_SIZE));
    }

    // Translate them in parallel, then apply all writes
    const t0 = Date.now();
    const translated = await mapWithConcurrency(batches, CONCURRENCY, translateBatch);

    let writtenThisPage = 0;
    for (const items of translated) {
      if (!items) continue;
      writtenThisPage += await applyUpdates(items);
    }

    totalAttempted += rows.length;
    totalDone += writtenThisPage;
    const elapsedTotal = Date.now() - start;
    const rate = totalDone / (elapsedTotal / 1000);
    const eta = rate > 0 ? Math.round((remaining - totalDone) / rate) : 0;
    console.log(
      `Page ${pageNum}: wrote ${writtenThisPage}/${rows.length}, total ${totalDone}, ` +
        `elapsed ${fmtDuration(elapsedTotal)}, rate ${rate.toFixed(1)}/s, eta ${eta}s`
    );

    // Defensive: if a page produced 0 writes (e.g. transient AI failure), back off
    if (writtenThisPage === 0) {
      console.warn("  Page produced 0 writes — pausing 10s to avoid hot loop.");
      await new Promise((r) => setTimeout(r, 10000));
    }
  }

  console.log(
    `\nDone. Translated ${totalDone} rows in ${fmtDuration(Date.now() - start)}.`
  );
  const leftover = await countRemaining();
  if (leftover > 0) {
    console.log(`${leftover} rows still untranslated (likely AI errors). Re-run the script.`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
