/**
 * Skrapar ev-database.org för tekniska specifikationer och genererar app/lib/cars.ts.
 *
 * Användning:  node scripts/update-cars.mjs
 *
 * Teknisk data (batteri, räckvidd, förbrukning, laddtid, bagage, sitsar) hämtas automatiskt.
 * Pris (SEK), storlekskategori och användningsområden underhålls manuellt i CARS-listan nedan.
 */

import { load } from "cheerio";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "app", "lib", "cars.ts");

const DELAY_MS = 3000;
const MAX_RETRIES = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ────────────────────────────────────────────────────────────────────────────
// Manuellt underhållen lista – lägg till / ta bort bilar här.
//   url:      ev-database.org bil-URL
//   id:       unikt slug-id (används i routes & ankarlänkar)
//   priceSek: nypris (från) i SEK – uppdatera manuellt
//   size:     compact | medium | suv | premium
//   useCases: city | commuter | family | adventure | premium
//   emoji:    valfri visuell markör
// ────────────────────────────────────────────────────────────────────────────
const CARS = [
  // ── Kompakt ─────────────────────────────────────────────────────────────── (priser uppdaterade 2026-03-04)
  { url: "https://ev-database.org/car/1909/Volvo-EX30-Single-Motor", id: "volvo-ex30", priceSek: 429_000, size: "compact", useCases: ["city", "commuter"], emoji: "🇸🇪" },
  { url: "https://ev-database.org/car/1708/MG-MG4-Electric-64-kWh", id: "mg4", priceSek: 369_990, size: "compact", useCases: ["city", "commuter"], emoji: "💰" },
  { url: "https://ev-database.org/car/1782/BYD-ATTO-3", id: "byd-atto3", priceSek: 484_900, size: "compact", useCases: ["city", "commuter"], emoji: "💰" },
  { url: "https://ev-database.org/car/3263/CUPRA-Born-170-kW---79-kWh", id: "cupra-born", priceSek: 485_900, size: "compact", useCases: ["city", "commuter"], emoji: "🏎️" },
  { url: "https://ev-database.org/car/1701/BMW-iX1-xDrive30", id: "bmw-ix1", priceSek: 563_900, size: "compact", useCases: ["commuter", "premium"], emoji: "✨" },
  { url: "https://ev-database.org/car/2212/Kia-EV3-Long-Range", id: "kia-ev3", priceSek: 508_300, size: "compact", useCases: ["city", "commuter"], emoji: "🔋" },
  { url: "https://ev-database.org/car/3033/Skoda-Elroq-85", id: "skoda-elroq", priceSek: 569_900, size: "compact", useCases: ["city", "commuter", "family"], emoji: "🚗" },
  { url: "https://ev-database.org/car/3300/Kia-EV5-814-kWh", id: "kia-ev5", priceSek: 553_900, size: "suv", useCases: ["family", "commuter"], emoji: "🔋" },

  // ── Mellanklass / Sedan ───────────────────────────────────────────────────
  { url: "https://ev-database.org/car/3404/Tesla-Model-3-Premium-RWD", id: "tesla-model-3", priceSek: 519_990, size: "medium", useCases: ["commuter", "family"], emoji: "⚡" },
  { url: "https://ev-database.org/car/2001/BYD-SEAL-825-kWh-RWD-Design", id: "byd-seal", priceSek: 589_900, size: "medium", useCases: ["commuter", "family"], emoji: "🦭" },
  { url: "https://ev-database.org/car/3151/Polestar-2-Long-Range-Single-Motor", id: "polestar-2", priceSek: 489_000, size: "medium", useCases: ["commuter", "premium"], emoji: "✨" },
  { url: "https://ev-database.org/car/3439/Hyundai-IONIQ-6-84-kWh-RWD", id: "hyundai-ioniq6", priceSek: 589_900, size: "medium", useCases: ["commuter", "premium"], emoji: "💨" },
  { url: "https://ev-database.org/car/3334/Volkswagen-ID3-Pro-S", id: "vw-id3", priceSek: 488_900, size: "compact", useCases: ["city", "commuter"], emoji: "🚗" },
  { url: "https://ev-database.org/car/3257/Volkswagen-ID7-Pro-S", id: "vw-id7", priceSek: 664_900, size: "medium", useCases: ["commuter", "family"], emoji: "🚗" },
  { url: "https://ev-database.org/car/3260/Volkswagen-ID7-Tourer-Pro-S", id: "vw-id7-tourer", priceSek: 690_000, size: "medium", useCases: ["family", "commuter"], emoji: "🚗" },

  // ── SUV / Familj ──────────────────────────────────────────────────────────
  { url: "https://ev-database.org/car/3417/Tesla-Model-Y-Long-Range-RWD", id: "tesla-model-y", priceSek: 574_990, size: "suv", useCases: ["family", "adventure"], emoji: "🚙" },
  { url: "https://ev-database.org/car/3159/Volvo-EX40-Single-Motor-ER", id: "volvo-ex40", priceSek: 607_000, size: "suv", useCases: ["family", "commuter"], emoji: "🇸🇪" },
  { url: "https://ev-database.org/car/3441/Volvo-EX60-P6", id: "volvo-ex60", priceSek: 689_000, size: "suv", useCases: ["family", "premium"], emoji: "🇸🇪" },
  { url: "https://ev-database.org/car/3250/Volkswagen-ID4-Pro", id: "vw-id4", priceSek: 586_900, size: "suv", useCases: ["family", "commuter"], emoji: "🚗" },
  { url: "https://ev-database.org/car/3254/Volkswagen-ID5-Pro", id: "vw-id5", priceSek: 613_900, size: "suv", useCases: ["family", "commuter"], emoji: "🚗" },
  { url: "https://ev-database.org/car/3028/Kia-EV6-Long-Range-2WD", id: "kia-ev6", priceSek: 599_900, size: "medium", useCases: ["commuter", "family", "adventure"], emoji: "🔋" },
  { url: "https://ev-database.org/car/2236/Hyundai-IONIQ-5-84-kWh-RWD", id: "hyundai-ioniq5", priceSek: 519_900, size: "suv", useCases: ["family", "commuter"], emoji: "⚡" },
  { url: "https://ev-database.org/car/3097/Skoda-Enyaq-85", id: "skoda-enyaq", priceSek: 569_900, size: "suv", useCases: ["family", "adventure"], emoji: "🧳" },
  { url: "https://ev-database.org/car/2067/BYD-SEAL-U-87-kWh-Design", id: "byd-seal-u", priceSek: 469_900, size: "suv", useCases: ["family", "commuter"], emoji: "💰" },
  { url: "https://ev-database.org/car/3070/BYD-SEALION-7-825-kWh-RWD-Comfort", id: "byd-sealion7", priceSek: 569_900, size: "suv", useCases: ["family", "adventure"], emoji: "🦁" },
  { url: "https://ev-database.org/car/3454/Ford-Explorer-Extended-Range-RWD", id: "ford-explorer", priceSek: 489_900, size: "suv", useCases: ["family", "commuter"], emoji: "🚙" },
  { url: "https://ev-database.org/car/3219/Renault-Scenic-E-Tech-EV87-220hp", id: "renault-scenic", priceSek: 549_900, size: "suv", useCases: ["family", "commuter"], emoji: "🇫🇷" },

  // ── Stor / Premium ────────────────────────────────────────────────────────
  { url: "https://ev-database.org/car/3323/Volvo-EX90-Single-Motor", id: "volvo-ex90", priceSek: 899_000, size: "premium", useCases: ["family", "premium", "adventure"], emoji: "👑" },
  { url: "https://ev-database.org/car/1834/Kia-EV9-998-kWh-RWD", id: "kia-ev9", priceSek: 701_900, size: "premium", useCases: ["family", "adventure"], emoji: "🏔️" },
  { url: "https://ev-database.org/car/2154/Volkswagen-ID-Buzz-LWB-Pro", id: "vw-id-buzz", priceSek: 646_900, size: "premium", useCases: ["family", "adventure"], emoji: "🚌" },
  { url: "https://ev-database.org/car/3326/Polestar-3-Rear-Motor", id: "polestar-3", priceSek: 924_000, size: "premium", useCases: ["premium", "adventure"], emoji: "✨" },
];

// ────────────────────────────────────────────────────────────────────────────
// Scraping helpers
// ────────────────────────────────────────────────────────────────────────────

function extractText($, label) {
  const cell = $("table td, table th")
    .filter((_, el) => $(el).text().trim().toLowerCase().startsWith(label.toLowerCase()))
    .first()
    .next("td");
  return cell.text().trim();
}

function parseNumber(str) {
  if (!str) return 0;
  const n = parseFloat(str.replace(/[^\d.,\-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: { "User-Agent": "EV-Kompassen-Updater/1.0 (educational project)" },
    });
    if (res.ok) return res;
    if (res.status === 429 && attempt < retries) {
      const wait = attempt * 10_000;
      console.warn(`    ⏳ 429 rate-limit, vantar ${wait / 1000}s (forsok ${attempt}/${retries})...`);
      await sleep(wait);
      continue;
    }
    return res;
  }
}

async function scrapeCar(carCfg) {
  const res = await fetchWithRetry(carCfg.url);
  if (!res || !res.ok) {
    console.warn(`  ⚠ ${carCfg.id}: HTTP ${res?.status || "?"} – hoppar över`);
    return null;
  }
  const html = await res.text();
  const $ = load(html);

  // Title → brand + model
  const pageTitle = $("h1").first().text().trim() || $("title").text().split(" price")[0].trim();

  // Key specs from the top summary area
  const specItems = $(".data-table td, .specs-table td, .title-table td, td");
  const allText = $("body").text();

  // Battery useable – look for "kWh" pattern near "Useable Battery"
  let batteryKwh = 0;
  const batteryMatch = allText.match(/([\d.]+)\s*kWh\s*\*?\s*Useable Battery/i)
    || allText.match(/Useable Battery[:\s]*([\d.]+)\s*kWh/i);
  if (batteryMatch) batteryKwh = parseFloat(batteryMatch[1]);

  // Real range
  let rangeKm = 0;
  const rangeMatch = allText.match(/([\d]+)\s*km\s*\*?\s*Real Range/i)
    || allText.match(/Real Range[:\s]*([\d]+)\s*km/i);
  if (rangeMatch) rangeKm = parseInt(rangeMatch[1]);

  // Efficiency (Wh/km) → kWh/mil = Wh/km * 10 / 1000 = Wh/km / 100
  let kwhPerMile = 0;
  const effMatch = allText.match(/([\d]+)\s*Wh\/km\s*\*?\s*Efficiency/i)
    || allText.match(/Efficiency[:\s]*([\d]+)\s*Wh\/km/i);
  if (effMatch) kwhPerMile = parseFloat(effMatch[1]) / 100;

  // Cargo volume
  let trunkLiters = 0;
  const cargoText = extractText($, "Cargo Volume");
  if (cargoText) trunkLiters = parseNumber(cargoText);

  // Seats
  let seats = 5;
  const seatsText = extractText($, "Seats");
  if (seatsText) {
    const s = parseInt(seatsText);
    if (s > 0 && s <= 9) seats = s;
  }

  // Fast charge 10→80%: find the shortest time (fastest charging) in CCS tables
  let fastChargeMin = 0;
  const chargeTimes = [];
  $("table").each((_, table) => {
    const tableText = $(table).text();
    if (tableText.includes("CCS") || tableText.includes("Supercharger") || tableText.includes("DC")) {
      $(table).find("tr").each((_, tr) => {
        const cells = $(tr).find("td");
        if (cells.length >= 4) {
          const timeText = cells.eq(3).text().trim();
          const minMatch = timeText.match(/(\d+)\s*min/);
          if (minMatch) chargeTimes.push(parseInt(minMatch[1]));
        }
      });
    }
  });
  if (chargeTimes.length > 0) {
    fastChargeMin = Math.min(...chargeTimes);
  }
  // Fallback: manufacturer claimed spec
  if (fastChargeMin === 0) {
    const claimedSection = allText.match(/Claimed Specifications[\s\S]{0,500}?(\d+)\s*min/i);
    if (claimedSection) fastChargeMin = parseInt(claimedSection[1]);
  }
  // Fallback 2: any "10 - 80" context
  if (fastChargeMin === 0) {
    const fcMatch = allText.match(/10\s*[–\-]\s*80\s*%[\s\S]{0,200}?(\d+)\s*min/i);
    if (fcMatch) fastChargeMin = parseInt(fcMatch[1]);
  }

  // Car body / segment
  const bodyText = extractText($, "Car Body");
  const segmentText = extractText($, "Segment");

  // Year from title or page
  let year = 2025;
  const yearMatch = pageTitle.match(/\((\d{4})/);
  if (yearMatch) year = parseInt(yearMatch[1]);

  // Build description from key specs
  const brandModel = pageTitle.replace(/\s*\(.*\)/, "").trim();
  const parts = brandModel.split(" ");
  const brand = parts[0] || "";
  const model = parts.slice(1).join(" ") || "";

  return {
    id: carCfg.id,
    brand,
    model,
    priceSek: carCfg.priceSek,
    rangeKm,
    batteryKwh,
    kwhPerMile: Math.round(kwhPerMile * 100) / 100,
    size: carCfg.size,
    useCases: carCfg.useCases,
    seats,
    trunkLiters,
    fastChargeMin,
    year,
    description: `${bodyText || "Elbil"}${segmentText ? ` (${segmentText})` : ""}. Rackvidd ${rangeKm} km, batteri ${batteryKwh} kWh.`,
    emoji: carCfg.emoji,
    _source: carCfg.url,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Generate TypeScript
// ────────────────────────────────────────────────────────────────────────────

function generateTS(cars) {
  const lines = [
    `/** Bilmodell-databas – uppdaterad ${new Date().toISOString().slice(0, 10)} via scripts/update-cars.mjs */`,
    ``,
    `export type CarSize = "compact" | "medium" | "suv" | "premium";`,
    `export type UseCase = "city" | "commuter" | "family" | "adventure" | "premium";`,
    ``,
    `export interface EvModel {`,
    `  id: string;`,
    `  brand: string;`,
    `  model: string;`,
    `  priceSek: number;`,
    `  rangeKm: number;`,
    `  batteryKwh: number;`,
    `  kwhPerMile: number;`,
    `  size: CarSize;`,
    `  useCases: UseCase[];`,
    `  seats: number;`,
    `  trunkLiters: number;`,
    `  fastChargeMin: number;`,
    `  year: number;`,
    `  description: string;`,
    `  emoji: string;`,
    `}`,
    ``,
    `export const EV_MODELS: EvModel[] = [`,
  ];

  for (const c of cars) {
    lines.push(`  {`);
    lines.push(`    id: ${JSON.stringify(c.id)},`);
    lines.push(`    brand: ${JSON.stringify(c.brand)},`);
    lines.push(`    model: ${JSON.stringify(c.model)},`);
    lines.push(`    priceSek: ${c.priceSek.toLocaleString("en").replace(/,/g, "_")},`);
    lines.push(`    rangeKm: ${c.rangeKm},`);
    lines.push(`    batteryKwh: ${c.batteryKwh},`);
    lines.push(`    kwhPerMile: ${c.kwhPerMile},`);
    lines.push(`    size: ${JSON.stringify(c.size)},`);
    lines.push(`    useCases: ${JSON.stringify(c.useCases)},`);
    lines.push(`    seats: ${c.seats},`);
    lines.push(`    trunkLiters: ${c.trunkLiters},`);
    lines.push(`    fastChargeMin: ${c.fastChargeMin},`);
    lines.push(`    year: ${c.year},`);
    lines.push(`    description: ${JSON.stringify(c.description)},`);
    lines.push(`    emoji: ${JSON.stringify(c.emoji)},`);
    lines.push(`  },`);
  }

  lines.push(`];`);
  lines.push(``);
  lines.push(`export function getModelById(id: string): EvModel | undefined {`);
  lines.push(`  return EV_MODELS.find((m) => m.id === id);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getModelsBySize(size: CarSize): EvModel[] {`);
  lines.push(`  return EV_MODELS.filter((m) => m.size === size);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getModelsByUseCase(useCase: UseCase): EvModel[] {`);
  lines.push(`  return EV_MODELS.filter((m) => m.useCases.includes(useCase));`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function getModelsByBudget(maxSek: number): EvModel[] {`);
  lines.push(`  return EV_MODELS.filter((m) => m.priceSek <= maxSek).sort((a, b) => a.priceSek - b.priceSek);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export function formatSek(amount: number): string {`);
  lines.push(`  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(amount);`);
  lines.push(`}`);
  lines.push(``);

  return lines.join("\n");
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 Skrapar ${CARS.length} bilar fran ev-database.org ...\n`);
  const results = [];

  for (let i = 0; i < CARS.length; i++) {
    const cfg = CARS[i];
    console.log(`  [${i + 1}/${CARS.length}] ${cfg.id} ...`);
    try {
      const car = await scrapeCar(cfg);
      if (car) {
        results.push(car);
        console.log(`    ✅ ${car.brand} ${car.model} – ${car.rangeKm} km, ${car.batteryKwh} kWh, ${car.fastChargeMin} min`);
      }
    } catch (err) {
      console.warn(`    ❌ ${cfg.id}: ${err.message}`);
    }
    if (i < CARS.length - 1) await sleep(DELAY_MS);
  }

  if (results.length < CARS.length * 0.5) {
    console.error(`\n❌ Bara ${results.length}/${CARS.length} bilar lyckades – skriver INTE over filen (saker sparre).`);
    console.error(`   Vanta en stund och kor skriptet igen.\n`);
    process.exit(1);
  }

  console.log(`\n📝 Skriver ${results.length} bilar till ${OUT_PATH} ...\n`);
  writeFileSync(OUT_PATH, generateTS(results), "utf-8");

  const missing = CARS.length - results.length;
  if (missing > 0) console.log(`⚠ ${missing} bil(ar) kunde inte skrapas – kolla URL:erna.\n`);
  console.log(`✅ Klart! ${results.length} bilar sparade.\n`);
}

main().catch(console.error);
