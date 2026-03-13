/**
 * Engångsscript: Genererar 30 historiska nyhetssammanfattningar
 * för de senaste 100 dagarna via Claude.
 *
 * Användning:  ANTHROPIC_API_KEY=sk-... node scripts/backfill-news.mjs
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_PATH = resolve(__dirname, "..", "data", "news.json");

const TOTAL_POSTS = 30;
const DAYS_BACK = 100;
const DELAY_MS = 2000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function dateString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function formatSwedishDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Generera 30 datum jämnt fördelade över 100 dagar (nyast först)
const dates = [];
for (let i = 0; i < TOTAL_POSTS; i++) {
  const daysAgo = Math.round((i * DAYS_BACK) / (TOTAL_POSTS - 1));
  dates.push(dateString(daysAgo));
}

async function generatePost(date) {
  const swedishDate = formatSwedishDate(date);

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    prompt: `Du är en elbilsjournalist som skriver dagliga nyhetssammanfattningar för den svenska sajten Elbilskompassen.

Skriv en nyhetssammanfattning för datumet ${date} (${swedishDate}). Basera den på verkliga händelser, trender och nyheter som var aktuella i den svenska elbilsvärlden kring det datumet. Tänk på vad som hände med elbilar, laddinfrastruktur, elbilspremier, batteriteknik, nya modeller, Northvolt, Tesla, Volvo, BYD, m.m. i Sverige och internationellt.

Svara ENBART med giltig JSON (ingen markdown, inga kodblock).

JSON-format:
{
  "title": "En engagerande rubrik som sammanfattar dagens viktigaste elbilsnyheter (max 80 tecken)",
  "summary": "3-5 stycken som sammanfattar de viktigaste nyheterna. Separera stycken med \\n\\n. Skriv informativt och neutralt på svenska.",
  "sources": [
    { "title": "Artikelrubrik", "url": "https://example.com", "source": "Mediakälla" }
  ]
}

Regler:
- Skriv på korrekt svenska
- Basera på verkliga händelser och trender kring det datumet (december 2025 – mars 2026)
- Inkludera 3-6 trovärdiga källor (SVT, DN, Ny Teknik, Dagens Industri, Teknikens Värld, etc.)
- Använd platshållar-URLer (t.ex. https://www.svt.se/nyheter/...) – det viktiga är innehållet
- Sammanfattningen ska vara informativ och objektiv
- Varje sammanfattning ska vara unik och relevant för sitt datum
- Nämn inte att du är en AI`,
    maxTokens: 2000,
  });

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Kunde inte parsa JSON");
    parsed = JSON.parse(jsonMatch[0]);
  }

  return {
    date,
    title: parsed.title,
    summary: parsed.summary,
    sources: parsed.sources || [],
    generatedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log(`Genererar ${TOTAL_POSTS} nyhetsposter för de senaste ${DAYS_BACK} dagarna...\n`);

  const posts = [];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    console.log(`  [${i + 1}/${TOTAL_POSTS}] ${date} ...`);
    try {
      const post = await generatePost(date);
      posts.push(post);
      console.log(`    ✅ "${post.title}"`);
    } catch (err) {
      console.error(`    ❌ Misslyckades: ${err.message}`);
    }
    if (i < dates.length - 1) await sleep(DELAY_MS);
  }

  // Sortera nyast först
  posts.sort((a, b) => b.date.localeCompare(a.date));

  writeFileSync(NEWS_PATH, JSON.stringify(posts, null, 2) + "\n", "utf-8");
  console.log(`\nKlart! ${posts.length} poster sparade till ${NEWS_PATH}`);
}

main().catch((err) => {
  console.error("Fel:", err);
  process.exit(1);
});
