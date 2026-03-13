/**
 * Elbilspremie – data och beräkningslogik
 * Baserat på Naturvårdsverkets regler för den nya elbilspremien (2026-03-18).
 *
 * Kommunklassificering:
 *   "eligible"  – 177 landsbygdskommuner (hela kommunen kvalificerar)
 *   "partial"   – 99 tätortskommuner med områden med begränsad kollektivtrafik
 *   "excluded"  – 14 storstadskommuner helt uteslutna
 */

export type MunicipalityStatus = "eligible" | "partial" | "excluded";

export const MUNICIPALITY_STATUS: Record<string, MunicipalityStatus> = {
  // === EXCLUDED (14 storstadskommuner) ===
  Stockholm: "excluded",
  Göteborg: "excluded",
  Malmö: "excluded",
  Uppsala: "excluded",
  Linköping: "excluded",
  Västerås: "excluded",
  Örebro: "excluded",
  Helsingborg: "excluded",
  Norrköping: "excluded",
  Jönköping: "excluded",
  Umeå: "excluded",
  Lund: "excluded",
  Sundsvall: "excluded",
  Solna: "excluded",

  // === PARTIAL (99 tätortskommuner med blandade områden) ===
  Huddinge: "partial",
  Nacka: "partial",
  Södertälje: "partial",
  Botkyrka: "partial",
  Haninge: "partial",
  Tyresö: "partial",
  Täby: "partial",
  Sollentuna: "partial",
  Järfälla: "partial",
  Lidingö: "partial",
  Vallentuna: "partial",
  Österåker: "partial",
  Värmdö: "partial",
  Sigtuna: "partial",
  "Upplands Väsby": "partial",
  Norrtälje: "partial",
  Ekerö: "partial",
  Nykvarn: "partial",
  Salem: "partial",
  Vaxholm: "partial",
  Sundbyberg: "partial",
  Danderyd: "partial",
  Mölndal: "partial",
  Kungälv: "partial",
  Partille: "partial",
  Härryda: "partial",
  Lerum: "partial",
  Ale: "partial",
  Kungsbacka: "partial",
  Stenungsund: "partial",
  Tjörn: "partial",
  Öckerö: "partial",
  "Lilla Edet": "partial",
  Alingsås: "partial",
  Borås: "partial",
  Trollhättan: "partial",
  Vänersborg: "partial",
  Uddevalla: "partial",
  Skövde: "partial",
  Lidköping: "partial",
  Falköping: "partial",
  Mariestad: "partial",
  Skara: "partial",
  Halmstad: "partial",
  Varberg: "partial",
  Falkenberg: "partial",
  Kungsör: "partial",
  Hallstahammar: "partial",
  Köping: "partial",
  Sala: "partial",
  Enköping: "partial",
  Knivsta: "partial",
  Håbo: "partial",
  Tierp: "partial",
  Östhammar: "partial",
  Eskilstuna: "partial",
  Katrineholm: "partial",
  Nyköping: "partial",
  Strängnäs: "partial",
  Flen: "partial",
  Oxelösund: "partial",
  Trosa: "partial",
  Gnesta: "partial",
  Motala: "partial",
  Mjölby: "partial",
  Finspång: "partial",
  Landskrona: "partial",
  Trelleborg: "partial",
  Eslöv: "partial",
  Höör: "partial",
  Staffanstorp: "partial",
  Burlöv: "partial",
  Lomma: "partial",
  Svedala: "partial",
  Kävlinge: "partial",
  Ängelholm: "partial",
  Kristianstad: "partial",
  Karlskrona: "partial",
  Ronneby: "partial",
  Karlshamn: "partial",
  Kalmar: "partial",
  Växjö: "partial",
  Gävle: "partial",
  Sandviken: "partial",
  Falun: "partial",
  Borlänge: "partial",
  Luleå: "partial",
  Piteå: "partial",
  Boden: "partial",
  Skellefteå: "partial",
  Örnsköldsvik: "partial",
  Härnösand: "partial",
  Östersund: "partial",
  Karlstad: "partial",
  Kristinehamn: "partial",
  Arvika: "partial",
  Säffle: "partial",
  Visby: "partial",

  // === ELIGIBLE (177 landsbygdskommuner) ===
  "Upplands-Bro": "eligible",
  Nynäshamn: "eligible",
  Skinnskatteberg: "eligible",
  Surahammar: "eligible",
  Arboga: "eligible",
  Fagersta: "eligible",
  Norberg: "eligible",
  Heby: "eligible",
  Älvkarleby: "eligible",
  Vingåker: "eligible",
  Vadstena: "eligible",
  Ydre: "eligible",
  Kinda: "eligible",
  Åtvidaberg: "eligible",
  Valdemarsvik: "eligible",
  Boxholm: "eligible",
  Ödeshög: "eligible",
  Söderköping: "eligible",
  Tranås: "eligible",
  Aneby: "eligible",
  Eksjö: "eligible",
  Gislaved: "eligible",
  Gnosjö: "eligible",
  Habo: "eligible",
  Mullsjö: "eligible",
  Nässjö: "eligible",
  Sävsjö: "eligible",
  Vaggeryd: "eligible",
  Vetlanda: "eligible",
  Värnamo: "eligible",
  Alvesta: "eligible",
  Lessebo: "eligible",
  Ljungby: "eligible",
  Markaryd: "eligible",
  Tingsryd: "eligible",
  Uppvidinge: "eligible",
  Älmhult: "eligible",
  Borgholm: "eligible",
  Emmaboda: "eligible",
  Hultsfred: "eligible",
  Högsby: "eligible",
  Mönsterås: "eligible",
  Mörbylånga: "eligible",
  Nybro: "eligible",
  Oskarshamn: "eligible",
  Torsås: "eligible",
  Vimmerby: "eligible",
  Västervik: "eligible",
  Olofström: "eligible",
  Sölvesborg: "eligible",
  Bromölla: "eligible",
  Hässleholm: "eligible",
  Osby: "eligible",
  Perstorp: "eligible",
  "Östra Göinge": "eligible",
  Simrishamn: "eligible",
  Sjöbo: "eligible",
  Skurup: "eligible",
  Tomelilla: "eligible",
  Ystad: "eligible",
  Båstad: "eligible",
  Klippan: "eligible",
  Laholm: "eligible",
  Hylte: "eligible",
  Herrljunga: "eligible",
  Tibro: "eligible",
  Tidaholm: "eligible",
  Töreboda: "eligible",
  Götene: "eligible",
  Hjo: "eligible",
  Karlsborg: "eligible",
  Gullspång: "eligible",
  Vara: "eligible",
  Essunga: "eligible",
  Grästorp: "eligible",
  Mark: "eligible",
  Svenljunga: "eligible",
  Tranemo: "eligible",
  Ulricehamn: "eligible",
  Bollebygd: "eligible",
  Bengtsfors: "eligible",
  "Dals-Ed": "eligible",
  Färgelanda: "eligible",
  Mellerud: "eligible",
  Åmål: "eligible",
  Lysekil: "eligible",
  Munkedal: "eligible",
  Orust: "eligible",
  Sotenäs: "eligible",
  Strömstad: "eligible",
  Tanum: "eligible",
  Säter: "eligible",
  Hedemora: "eligible",
  Avesta: "eligible",
  Ludvika: "eligible",
  Smedjebacken: "eligible",
  Mora: "eligible",
  Orsa: "eligible",
  Älvdalen: "eligible",
  Leksand: "eligible",
  Rättvik: "eligible",
  Gagnef: "eligible",
  Vansbro: "eligible",
  "Malung-Sälen": "eligible",
  Hofors: "eligible",
  Ockelbo: "eligible",
  Söderhamn: "eligible",
  Bollnäs: "eligible",
  Hudiksvall: "eligible",
  Ljusdal: "eligible",
  Nordanstig: "eligible",
  Ovanåker: "eligible",
  Timrå: "eligible",
  Ånge: "eligible",
  Kramfors: "eligible",
  Sollefteå: "eligible",
  Berg: "eligible",
  Bräcke: "eligible",
  Härjedalen: "eligible",
  Krokom: "eligible",
  Ragunda: "eligible",
  Strömsund: "eligible",
  Åre: "eligible",
  Nordmaling: "eligible",
  Bjurholm: "eligible",
  Vindeln: "eligible",
  Robertsfors: "eligible",
  Norsjö: "eligible",
  Malå: "eligible",
  Storuman: "eligible",
  Sorsele: "eligible",
  Dorotea: "eligible",
  Vilhelmina: "eligible",
  Åsele: "eligible",
  Lycksele: "eligible",
  Vännäs: "eligible",
  Kalix: "eligible",
  Haparanda: "eligible",
  Överkalix: "eligible",
  Övertorneå: "eligible",
  Pajala: "eligible",
  Gällivare: "eligible",
  Jokkmokk: "eligible",
  Älvsbyn: "eligible",
  Arvidsjaur: "eligible",
  Arjeplog: "eligible",
  Kiruna: "eligible",
  Degerfors: "eligible",
  Hallsberg: "eligible",
  Kumla: "eligible",
  Laxå: "eligible",
  Lekeberg: "eligible",
  Lindesberg: "eligible",
  Ljusnarsberg: "eligible",
  Nora: "eligible",
  Askersund: "eligible",
  Hällefors: "eligible",
  Karlskoga: "eligible",
  Filipstad: "eligible",
  Forshaga: "eligible",
  Grums: "eligible",
  Hagfors: "eligible",
  Hammarö: "eligible",
  Kil: "eligible",
  Munkfors: "eligible",
  Storfors: "eligible",
  Sunne: "eligible",
  Torsby: "eligible",
  Eda: "eligible",
  Årjäng: "eligible",
  Gotland: "eligible",
  Svalöv: "eligible",
  Höganäs: "eligible",
  Vellinge: "eligible",
  Örkelljunga: "eligible",
  Bjuv: "eligible",
  Åstorp: "eligible",
};

/** Sorterad lista med alla kommunnamn (för dropdown/sökfält) */
export const MUNICIPALITY_NAMES = Object.keys(MUNICIPALITY_STATUS).sort(
  (a, b) => a.localeCompare(b, "sv")
);

/** Inkomstgränser (kr/år) */
export const INCOME_LIMITS = {
  /** Max inkomst singel (80 % av medelinkomst) */
  singleMax: 352_000,
  /** Max inkomst sambo/gift (80 % av medelinkomst) */
  coupleMax: 531_520,
  /** Starttillägg-gräns singel (50 % av medelinkomst) */
  singleStartBonus: 220_000,
  /** Starttillägg-gräns sambo/gift (50 % av medelinkomst) */
  coupleStartBonus: 332_200,
  /** Max månadsinkomst innan statlig skatt (ca) */
  stateTaxThreshold: 51_000,
} as const;

/** Priskrav */
export const PRICE_LIMITS = {
  purchaseMin: 64_800,
  purchaseMax: 450_000,
  leaseMin: 1_800,
  leaseMax: 4_600,
} as const;

/** Premiebelopp */
export const PREMIUM_AMOUNTS = {
  /** Grundpremie: 1 300 kr/mån × 36 månader */
  base: 46_800,
  /** Starttillägg */
  startBonus: 18_000,
  /** Max total */
  max: 64_800,
} as const;

// ─── Eligibility check ────────────────────────────────────────────

export interface PremiumAnswers {
  municipality: string;
  householdType: "single" | "couple";
  income: number;
  hadEvBefore: boolean;
  purchaseType: "buy" | "lease";
  price: number;
}

export interface EligibilityResult {
  eligible: boolean;
  amount: number;
  hasStartBonus: boolean;
  reasons: string[];
}

export function checkEligibility(a: PremiumAnswers): EligibilityResult {
  const reasons: string[] = [];

  // 1. Kommun
  const status = MUNICIPALITY_STATUS[a.municipality];
  if (status === "excluded") {
    reasons.push(
      `${a.municipality} ingår inte i de kommuner som omfattas av elbilspremien.`
    );
  } else if (!status) {
    reasons.push("Kommunen kunde inte hittas i listan.");
  }

  // 2. Inkomst
  const incomeLimit =
    a.householdType === "single"
      ? INCOME_LIMITS.singleMax
      : INCOME_LIMITS.coupleMax;

  if (a.income > incomeLimit) {
    const label = a.householdType === "single" ? "singelhushåll" : "parhushåll";
    reasons.push(
      `Hushållets inkomst överstiger gränsen på ${incomeLimit.toLocaleString("sv-SE")} kr/år för ${label}.`
    );
  }

  // 3. Tidigare elbil
  if (a.hadEvBefore) {
    reasons.push(
      "Ingen i hushållet får ha ägt eller leasat en elbil/laddhybrid de senaste 12 månaderna."
    );
  }

  // 4. Pris
  if (a.purchaseType === "buy") {
    if (a.price < PRICE_LIMITS.purchaseMin) {
      reasons.push(
        `Bilens pris (${a.price.toLocaleString("sv-SE")} kr) är under minimigränsen ${PRICE_LIMITS.purchaseMin.toLocaleString("sv-SE")} kr.`
      );
    } else if (a.price > PRICE_LIMITS.purchaseMax) {
      reasons.push(
        `Bilens pris (${a.price.toLocaleString("sv-SE")} kr) överstiger maxgränsen ${PRICE_LIMITS.purchaseMax.toLocaleString("sv-SE")} kr.`
      );
    }
  } else {
    if (a.price < PRICE_LIMITS.leaseMin) {
      reasons.push(
        `Leasingkostnaden (${a.price.toLocaleString("sv-SE")} kr/mån) är under minimigränsen ${PRICE_LIMITS.leaseMin.toLocaleString("sv-SE")} kr/mån.`
      );
    } else if (a.price > PRICE_LIMITS.leaseMax) {
      reasons.push(
        `Leasingkostnaden (${a.price.toLocaleString("sv-SE")} kr/mån) överstiger maxgränsen ${PRICE_LIMITS.leaseMax.toLocaleString("sv-SE")} kr/mån.`
      );
    }
  }

  // Starttillägg
  const startBonusLimit =
    a.householdType === "single"
      ? INCOME_LIMITS.singleStartBonus
      : INCOME_LIMITS.coupleStartBonus;
  const hasStartBonus = a.income < startBonusLimit && reasons.length === 0;

  const eligible = reasons.length === 0;
  const amount = eligible
    ? hasStartBonus
      ? PREMIUM_AMOUNTS.max
      : PREMIUM_AMOUNTS.base
    : 0;

  return { eligible, amount, hasStartBonus, reasons };
}
