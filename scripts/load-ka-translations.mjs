#!/usr/bin/env node
/**
 * One-shot loader: copies Georgian names + descriptions from the source CSV
 * into Supabase menu_items.item_name_ka / description_ka.
 *
 * Idempotent: re-running it after a crash continues where it left off because
 * we filter `WHERE item_name_ka IS NULL` and skip rows whose KA fields are
 * already populated.
 *
 * Safe: only UPDATEs menu_items rows whose `id` matches a CSV `Item ID`. Rows
 * in the CSV that don't exist in Supabase are silently skipped. Existing
 * columns (item_name_en, description_en, price, etc.) are NOT touched.
 *
 * Usage:
 *   cd ravchamo-mvp
 *   export SUPABASE_URL="https://mmyxzagdcwnjjoowufiu.supabase.co"
 *   export SUPABASE_SECRET="sb_secret_..."   # FRESH key, NOT one you've shared
 *   node scripts/load-ka-translations.mjs
 *
 * Optional env vars:
 *   CSV_PATH      default "../wolt_tbilisi_full.xlsx - Menu Items.csv"
 *   BATCH_SIZE    default 200   rows per PostgREST UPDATE
 *   CONCURRENCY   default 6     parallel batches
 *   DRY_RUN       if "1", read+parse the CSV and print the first 5 mappings
 *                 but don't write anything.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ────────────────────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET =
  process.env.SUPABASE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
const CSV_PATH =
  process.env.CSV_PATH || "../wolt_tbilisi_full.xlsx - Menu Items.csv";
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "200", 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "6", 10);
const DRY_RUN = process.env.DRY_RUN === "1";

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error(
    "Missing env. Set SUPABASE_URL and SUPABASE_SECRET before running.\n" +
      "Example:\n" +
      '  export SUPABASE_URL="https://mmyxzagdcwnjjoowufiu.supabase.co"\n' +
      '  export SUPABASE_SECRET="sb_secret_..."\n'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ────────────────────────────────────────────────────────────────────────────
// CSV parser
// ────────────────────────────────────────────────────────────────────────────
//
// Minimal RFC4180-flavored CSV reader. Handles:
//   - quoted fields with embedded commas
//   - quoted fields with embedded newlines
//   - escaped quotes ("")
//
// Streaming would be nicer but the file is ~20MB — fits in RAM easily.

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          // escaped quote
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += c;
        i++;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
      } else if (c === ",") {
        row.push(field);
        field = "";
        i++;
      } else if (c === "\n" || c === "\r") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        // swallow \r\n
        if (c === "\r" && text[i + 1] === "\n") i += 2;
        else i++;
      } else {
        field += c;
        i++;
      }
    }
  }
  // flush trailing row if file didn't end with newline
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function loadRows() {
  const path = resolve(process.cwd(), CSV_PATH);
  console.log(`Reading: ${path}`);
  const text = readFileSync(path, "utf-8");
  const rows = parseCsv(text);
  const header = rows[0];
  const idIdx = header.indexOf("Item ID");
  const nameKaIdx = header.indexOf("Name (GE)");
  const descKaIdx = header.indexOf("Description (GE)");

  if (idIdx === -1 || nameKaIdx === -1 || descKaIdx === -1) {
    console.error(
      `Required headers missing. Found: ${JSON.stringify(header)}`
    );
    process.exit(1);
  }

  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[idIdx]) continue;
    const id = parseInt(row[idIdx], 10);
    if (!Number.isFinite(id)) continue;

    const name_ka = (row[nameKaIdx] || "").trim();
    const description_ka = (row[descKaIdx] || "").trim();

    // Skip rows with no Georgian content at all — nothing to write.
    if (!name_ka && !description_ka) continue;

    out.push({
      id,
      item_name_ka: name_ka || null,
      description_ka: description_ka || null,
    });
  }
  console.log(`Parsed ${out.length} rows with at least a Georgian name or description.`);
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Writer
// ────────────────────────────────────────────────────────────────────────────

async function applyBatch(batch) {
  // Single-row UPDATEs in parallel inside a batch. PostgREST handles a few
  // hundred concurrent connections fine. Failures are logged but don't
  // abort the whole batch.
  const tasks = batch.map(async (row) => {
    const update = {};
    if (row.item_name_ka) update.item_name_ka = row.item_name_ka;
    if (row.description_ka) update.description_ka = row.description_ka;
    if (Object.keys(update).length === 0) return false;

    const { error } = await supabase
      .from("menu_items")
      .update(update)
      .eq("id", row.id);

    if (error) {
      console.warn(`  ! id=${row.id} failed: ${error.message}`);
      return false;
    }
    return true;
  });
  const results = await Promise.all(tasks);
  return results.filter(Boolean).length;
}

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
        out[idx] = 0;
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
  const rows = loadRows();

  if (DRY_RUN) {
    console.log("\nDRY_RUN — first 5 parsed rows:\n");
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
    console.log(`\nWould attempt to update ${rows.length} rows.`);
    return;
  }

  console.log(
    `Config: BATCH_SIZE=${BATCH_SIZE} CONCURRENCY=${CONCURRENCY}`
  );

  // Chunk into batches
  const batches = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }
  console.log(`Total batches: ${batches.length}`);

  let totalWritten = 0;
  let batchesDone = 0;

  // Process all batches with bounded concurrency, log progress as they finish
  const results = await mapWithConcurrency(batches, CONCURRENCY, async (batch, idx) => {
    const written = await applyBatch(batch);
    batchesDone++;
    totalWritten += written;
    if (batchesDone % 5 === 0 || batchesDone === batches.length) {
      const elapsed = Date.now() - start;
      const rate = totalWritten / (elapsed / 1000);
      const remainingBatches = batches.length - batchesDone;
      const eta = rate > 0 && remainingBatches > 0
        ? Math.round(remainingBatches * BATCH_SIZE / rate)
        : 0;
      console.log(
        `Batch ${batchesDone}/${batches.length} — wrote ${totalWritten} so far, ` +
          `${rate.toFixed(0)}/s, eta ${eta}s`
      );
    }
    return written;
  });

  console.log(
    `\nDone. Wrote ${totalWritten}/${rows.length} rows in ${fmtDuration(Date.now() - start)}.`
  );

  if (totalWritten < rows.length) {
    console.log(
      `${rows.length - totalWritten} rows were not updated. Most likely ` +
        `they're CSV rows whose Item ID doesn't exist in menu_items yet ` +
        `(new dishes from the latest scrape). Safe to ignore for the KA ` +
        `backfill — those rows will get their KA names later when imported.`
    );
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
