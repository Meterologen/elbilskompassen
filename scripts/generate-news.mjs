/**
 * Hämtar elbilsnyheter från svenska RSS-flöden, filtrerar relevanta artiklar,
 * och genererar en AI-sammanfattning med Claude. Sparar till data/news.json.
 *
 * Användning:  ANTHROPIC_API_KEY=sk-... node scripts/generate-news.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { load } from "cheerio";

const __dirname = dirname(fileURLToPath(import.meta.url));
const NEWS_PATH = resolve(__dirname, "..", "data", "news.json");
const MAX_POSTS = 30;

// ── RSS-flöden ────────────────────────────────────────────────────────────────
const RSS_FEEDS = [
  { name: "SVT Nyheter", url: "https://www.svt.se/nyheter/rss.xml" },
  { name: "Aftonbladet", url: "https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/" },
  { name: "Expressen", url: "https://feeds.expressen.se/nyheter/" },
  { name: "Ny Teknik", url: "https://www.nyteknik.se/rss" },
  { name: "Dagens Industri", url: "https://www.di.se/rss" },
  { name: "Teknikens Värld", url: "https://teknikensvarld.se/feed/" },
];

// ── Nyckelord för filtrering ──────────────────────────────────────────────────
const KEYWORDS = [
  "elbil", "elbilar", "elbilen", "elbilens", "elbils",
  "laddstation", "laddstolpe", "snabbladdare", "laddinfrastruktur", "laddhybrid",
  "elbilspremie", "elbilsbonus", "klimatbonus",
  "tesla", "volvo ex30", "volvo ex40", "volvo ex60", "volvo ex90",
  "polestar", "byd",
  "kia ev", "hyundai ioniq", "volkswagen id",
  "batterifordon", "eldriven", "eldrivna",
  "räckvidd", "räckvidden",
  "laddbox", "hemmaladdning",
];

const keywordPattern = new RegExp(KEYWORDS.join("|"), "i");

// ── Hjälpfunktioner ───────────────────────────────────────────────────────────

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { "User-Agent": "Elbilskompassen/1.0 (news aggregator)" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseRss(xml, sourceName) {
  const $ = load(xml, { xmlMode: true });
  const articles = [];

  $("item").each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    const link = $(el).find("link").first().text().trim();
    const description = $(el).find("description").first().text().trim();
    const pubDate = $(el).find("pubDate").first().text().trim();

    if (title && link) {
      articles.push({ title, link, description, pubDate, source: sourceName });
    }
  });

  return articles;
}

function filterRelevant(articles) {
  return articles.filter((a) => {
    const text = `${a.title} ${a.description}`.toLowerCase();
    return keywordPattern.test(text);
  });
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

// ── Huvudflöde ────────────────────────────────────────────────────────────────

async function main() {
  const today = todayString();

  // 1. Kolla idempotens
  let existing = [];
  try {
    existing = JSON.parse(readFileSync(NEWS_PATH, "utf-8"));
  } catch {
    existing = [];
  }

  if (existing.some((p) => p.date === today)) {
    console.log(`Dagens sammanfattning (${today}) finns redan – avslutar.`);
    process.exit(0);
  }

  // 2. Hämta RSS-flöden parallellt
  console.log(`Hämtar ${RSS_FEEDS.length} RSS-flöden...`);
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const xml = await fetchFeed(feed);
        const articles = parseRss(xml, feed.name);
        console.log(`  ${feed.name}: ${articles.length} artiklar`);
        return articles;
      } catch (err) {
        console.warn(`  ${feed.name}: misslyckades (${err.message})`);
        return [];
      }
    })
  );

  const allArticles = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  );
  console.log(`Totalt ${allArticles.length} artiklar hämtade.`);

  // 3. Filtrera relevanta
  const relevant = filterRelevant(allArticles);
  console.log(`${relevant.length} relevanta elbilsartiklar efter filtrering.`);

  const hasArticles = relevant.length > 0;

  // 4. Deduplicera på URL
  const seen = new Set();
  const unique = relevant.filter((a) => {
    if (seen.has(a.link)) return false;
    seen.add(a.link);
    return true;
  });

  // 5. Begränsa till max 20 artiklar för prompten
  const forPrompt = unique.slice(0, 20);

  // 6. Skicka till Claude
  let prompt;

  if (hasArticles) {
    console.log(`Skickar ${forPrompt.length} artiklar till Claude för sammanfattning...`);

    const articleList = forPrompt
      .map((a, i) => `${i + 1}. [${a.source}] ${a.title}\n   ${a.description}\n   ${a.link}`)
      .join("\n\n");

    prompt = `Du är en elbilsjournalist som skriver för svenska läsare. Nedan följer dagens elbilsrelaterade nyhetsartiklar från svenska medier.

Skriv en nyhetssammanfattning för dagen. Svara ENBART med giltig JSON (ingen markdown, inga kodblock).

JSON-format:
{
  "title": "En engagerande rubrik som sammanfattar dagens viktigaste elbilsnyheter (max 80 tecken)",
  "summary": "3-5 stycken som sammanfattar de viktigaste nyheterna. Separera stycken med \\n\\n. Skriv informativt och neutralt på svenska. Nämn källor i texten.",
  "sources": [
    { "title": "Artikelrubrik", "url": "https://...", "source": "Mediakälla" }
  ]
}

Regler:
- Skriv på korrekt svenska
- Fokusera på de viktigaste och mest intressanta nyheterna
- Inkludera max 8 källor i sources-arrayen (de mest relevanta)
- Sammanfattningen ska vara informativ och objektiv
- Nämn inte att du är en AI

Artiklar:

${articleList}`;
  } else {
    console.log("Inga relevanta RSS-artiklar — ber Claude skriva en omvärldsbevakning.");

    prompt = `Du är en elbilsjournalist som skriver för svenska läsare. Idag hittades inga nya elbilsartiklar i svenska RSS-flöden, men du ska ändå skriva en kort och intressant nyhetsuppdatering.

Dagens datum: ${today}

Skriv en nyhetssammanfattning som bevakar elbilsläget i Sverige och världen just nu. Du kan ta upp:
- Aktuella trender på den svenska elbilsmarknaden (priser, försäljning, laddinfrastruktur)
- Kommande modeller eller leasingerbjudanden
- Politiska beslut som påverkar elbilsägare (bonus, skatt, subventioner)
- Tips för den som funderar på elbil

Svara ENBART med giltig JSON (ingen markdown, inga kodblock).

JSON-format:
{
  "title": "En engagerande rubrik (max 80 tecken)",
  "summary": "2-4 stycken om aktuellt elbilsläge. Separera stycken med \\n\\n. Skriv informativt och neutralt på svenska.",
  "sources": []
}

Regler:
- Skriv på korrekt svenska
- Var informativ och objektiv
- Nämn inte att du är en AI
- sources ska vara en tom array eftersom det inte finns specifika artiklar att hänvisa till`;
  }

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    prompt,
    maxTokens: 2000,
  });

  // 7. Parsa AI-svar
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Försök extrahera JSON från svaret
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Kunde inte parsa AI-svaret som JSON:");
      console.error(text);
      process.exit(1);
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  const post = {
    date: today,
    title: parsed.title,
    summary: parsed.summary,
    sources: parsed.sources || [],
    generatedAt: new Date().toISOString(),
  };

  // 8. Spara
  existing.unshift(post);
  const trimmed = existing.slice(0, MAX_POSTS);
  writeFileSync(NEWS_PATH, JSON.stringify(trimmed, null, 2) + "\n", "utf-8");

  console.log(`\nKlart! Sparade "${post.title}" till ${NEWS_PATH}`);
  console.log(`Totalt ${trimmed.length} poster i news.json.`);
}

main().catch((err) => {
  console.error("Fel:", err);
  process.exit(1);
});
