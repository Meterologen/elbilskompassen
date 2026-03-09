/**
 * Elbilskompassen – 15 frågor som kartlägger vad användaren behöver.
 * Varje svar ger poäng till storlek, användning och budget.
 * I slutet matchas mot bilmodeller i cars.ts.
 */

import { type CarSize, type UseCase, EV_MODELS, type EvModel } from "./cars";

export interface CompassQuestion {
  id: number;
  question: string;
  optionA: { label: string; description: string };
  optionB: { label: string; description: string };
}

export interface CompassAnswer {
  questionId: number;
  choice: "A" | "B";
}

interface ScoreMap {
  size: Record<CarSize, number>;
  useCase: Record<UseCase, number>;
  budgetMax: number;
  rangeMin: number;
  fastChargeImportant: boolean;
  seatsMin: number;
  preferEuropean: boolean;
  openToUsed: boolean;
  awdImportant: boolean;
  towbarRequired: boolean;
  trunkImportant: boolean;
}

export const COMPASS_QUESTIONS: CompassQuestion[] = [
  {
    id: 1,
    question: "Hur ser din vardag ut?",
    optionA: { label: "Mest stadskörning", description: "Jag kör korta sträckor i stan – jobb, skola, affären." },
    optionB: { label: "Mycket landsväg/pendling", description: "Jag pendlar längre sträckor eller kör ofta mellan städer." },
  },
  {
    id: 2,
    question: "Vilken bilstorlek passar dig?",
    optionA: { label: "Liten och smidig", description: "Lätt att parkera, billigare att äga. Behöver inte stor bil." },
    optionB: { label: "Rymlig familjebil/SUV", description: "Plats för familj, barnvagn, semesterbagage." },
  },
  {
    id: 3,
    question: "Hur långt kör du normalt på en dag?",
    optionA: { label: "Under 5 mil", description: "Sällan mer än 50 km per dag." },
    optionB: { label: "Ofta över 5 mil", description: "Jag kör regelbundet 50–150+ km per dag." },
  },
  {
    id: 4,
    question: "Kan du ladda hemma?",
    optionA: { label: "Ja – villa/radhus/parkering med el", description: "Jag kan installera eller har redan en laddbox." },
    optionB: { label: "Nej – beroende av publik laddning", description: "Lägenhet eller parkering utan elmöjlighet." },
  },
  {
    id: 5,
    question: "Planerar du långa resor (semesterkörning)?",
    optionA: { label: "Sällan – vi flyger/tågar", description: "Bilen används mest lokalt." },
    optionB: { label: "Ja – vi kör till fjällen/Europa", description: "Lång räckvidd och snabb laddning viktigt." },
  },
  {
    id: 6,
    question: "Behöver du fyrhjulsdrift?",
    optionA: { label: "Nej, framhjuls-/bakhjulsdrift räcker", description: "Jag kör mest på asfalt, vinterdäck räcker." },
    optionB: { label: "Ja, det känns tryggt på vintern", description: "Jag kör ofta i snö, grus eller kuperad terräng." },
  },
  {
    id: 7,
    question: "Behöver du kunna dra släp?",
    optionA: { label: "Nej, ingen dragkrok", description: "Jag drar inte släpvagn, båt eller liknande." },
    optionB: { label: "Ja, jag behöver dragkrok", description: "Jag drar cykelhållare, släpkärra eller båt ibland." },
  },
  {
    id: 8,
    question: "Hur viktigt är bagageutrymmet?",
    optionA: { label: "Normalt räcker fint", description: "Vardagssaker och en väska – inget speciellt." },
    optionB: { label: "Stort bagageutrymme är viktigt", description: "Barnvagn, hundburslåda, semesterpackning – det ska få plats." },
  },
  {
    id: 9,
    question: "Åker ni ofta fler än 4 personer?",
    optionA: { label: "Nej – max 4", description: "Vi är 1–4 i bilen normalt." },
    optionB: { label: "Ja – ibland 5–7", description: "Vi behöver plats för stor familj eller vänner." },
  },
  {
    id: 10,
    question: "Vad är viktigast för dig?",
    optionA: { label: "Lågt pris", description: "Jag vill ha en bra elbil utan att det kostar skjortan." },
    optionB: { label: "Premiumkänsla", description: "Komfort, design och teknik är värt att betala extra för." },
  },
  {
    id: 11,
    question: "Hur tänker du kring bilmärke?",
    optionA: { label: "Helst europeiskt", description: "Volvo, VW, BMW, Polestar – trygghet i kända märken." },
    optionB: { label: "Bästa bil för pengarna", description: "Öppen för alla märken, inklusive BYD, MG och Kia." },
  },
  {
    id: 12,
    question: "Vad oroar dig mest med elbil?",
    optionA: { label: "Att det blir för dyrt", description: "Inköpspris och totalekonomi väger tyngst." },
    optionB: { label: "Att räckvidden inte räcker", description: "Jag vill inte behöva tänka på laddning hela tiden." },
  },
  {
    id: 13,
    question: "Hur viktig är snabb laddning?",
    optionA: { label: "Inte jätteviktigt", description: "Jag laddar mest hemma över natten." },
    optionB: { label: "Mycket viktigt", description: "Jag vill kunna snabbladda på 20–30 min vid långresa." },
  },
  {
    id: 14,
    question: "Vill du ha en helt ny elbil?",
    optionA: { label: "Ja – ny bil", description: "Jag vill ha garanti, senaste teknik och inga överraskningar." },
    optionB: { label: "Öppen för begagnad", description: "Om priset är rätt kan en 1–3 år gammal bil funka." },
  },
  {
    id: 15,
    question: "Hur snart vill du byta?",
    optionA: { label: "Inom 6 månader", description: "Jag är redo att ta steget snart." },
    optionB: { label: "Kollar runt – kanske inom ett år", description: "Jag vill lära mig mer först." },
  },
];

function buildScore(answers: CompassAnswer[]): ScoreMap {
  const score: ScoreMap = {
    size: { compact: 0, medium: 0, suv: 0, premium: 0 },
    useCase: { city: 0, commuter: 0, family: 0, adventure: 0, premium: 0 },
    budgetMax: 500_000,
    rangeMin: 300,
    fastChargeImportant: false,
    seatsMin: 5,
    preferEuropean: false,
    openToUsed: false,
    awdImportant: false,
    towbarRequired: false,
    trunkImportant: false,
  };

  for (const a of answers) {
    const c = a.choice;
    switch (a.questionId) {
      case 1: // Stadskörning vs landsväg
        if (c === "A") { score.useCase.city += 3; score.size.compact += 2; }
        else { score.useCase.commuter += 3; score.rangeMin = Math.max(score.rangeMin, 400); }
        break;
      case 2: // Liten vs rymlig
        if (c === "A") { score.size.compact += 3; score.size.medium += 1; }
        else { score.size.suv += 3; score.useCase.family += 2; }
        break;
      case 3: // Under 5 mil vs över
        if (c === "A") { score.useCase.city += 2; score.rangeMin = Math.min(score.rangeMin, 250); }
        else { score.useCase.commuter += 2; score.rangeMin = Math.max(score.rangeMin, 420); }
        break;
      case 4: // Ladda hemma vs publik
        if (c === "B") { score.rangeMin = Math.max(score.rangeMin, 400); score.fastChargeImportant = true; }
        break;
      case 5: // Sällan långresa vs ja
        if (c === "B") { score.rangeMin = Math.max(score.rangeMin, 450); score.useCase.adventure += 3; score.fastChargeImportant = true; }
        break;
      case 6: // Fyrhjulsdrift
        if (c === "B") { score.awdImportant = true; score.useCase.adventure += 1; }
        break;
      case 7: // Dragkrok
        if (c === "B") { score.towbarRequired = true; score.size.suv += 2; score.useCase.adventure += 1; }
        break;
      case 8: // Bagageutrymme
        if (c === "B") { score.trunkImportant = true; score.size.suv += 1; score.useCase.family += 2; }
        break;
      case 9: // Fler än 4 personer
        if (c === "B") { score.seatsMin = 7; score.size.premium += 2; score.size.suv += 1; }
        break;
      case 10: // Lågt pris vs premium
        if (c === "A") { score.budgetMax = 550_000; score.size.compact += 1; }
        else { score.size.premium += 3; score.useCase.premium += 3; score.budgetMax = 900_000; }
        break;
      case 11: // Märkeslojalitet
        if (c === "A") { score.preferEuropean = true; }
        break;
      case 12: // Oro: pris vs räckvidd
        if (c === "A") { score.budgetMax = Math.min(score.budgetMax, 550_000); }
        else { score.rangeMin = Math.max(score.rangeMin, 450); }
        break;
      case 13: // Snabb laddning
        if (c === "B") { score.fastChargeImportant = true; }
        break;
      case 14: // Ny vs begagnad
        if (c === "B") { score.openToUsed = true; score.budgetMax = Math.min(score.budgetMax, 500_000); }
        break;
      case 15: // Hur snart
        break;
    }
  }
  return score;
}

export interface CompassResult {
  topPicks: { car: EvModel; matchPercent: number }[];
  profileSummary: string;
  readyToBuy: boolean;
}

const EUROPEAN_BRANDS = ["Volvo", "Polestar", "Volkswagen", "BMW", "Škoda", "CUPRA", "Ford", "Renault"];
const CHINESE_BRANDS = ["BYD", "MG"];

export function getCompassResult(answers: CompassAnswer[]): CompassResult {
  const score = buildScore(answers);
  const readyToBuy = answers.find((a) => a.questionId === 15)?.choice === "A";

  const sizeRanking = Object.entries(score.size)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k as CarSize);
  const topSize = sizeRanking[0];
  const secondSize = sizeRanking[1];

  const useCaseRanking = Object.entries(score.useCase)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k as UseCase);
  const topUseCase = useCaseRanking[0];

  let candidates = EV_MODELS.filter((m) => {
    if (m.priceSek > score.budgetMax) return false;
    if (m.rangeKm < score.rangeMin) return false;
    if (m.seats < score.seatsMin) return false;
    if (score.fastChargeImportant && m.fastChargeMin > 30) return false;
    if (score.towbarRequired && !m.towbar) return false;
    if (score.preferEuropean && CHINESE_BRANDS.includes(m.brand)) return false;
    return true;
  });

  if (candidates.length === 0) {
    candidates = EV_MODELS.filter((m) => m.priceSek <= score.budgetMax * 1.2);
  }

  const scored = candidates.map((car) => {
    let pts = 0;
    if (car.size === topSize) pts += 10;
    if (car.size === secondSize) pts += 5;
    for (const uc of car.useCases) {
      const idx = useCaseRanking.indexOf(uc);
      if (idx >= 0) pts += (5 - idx);
    }
    if (car.rangeKm >= score.rangeMin) pts += 3;
    if (score.fastChargeImportant && car.fastChargeMin <= 25) pts += 3;
    if (score.trunkImportant && car.trunkLiters >= 500) pts += 3;
    if (score.awdImportant && car.awd) pts += 5;
    if (score.preferEuropean && EUROPEAN_BRANDS.includes(car.brand)) pts += 2;
    return { car, pts };
  });

  scored.sort((a, b) => b.pts - a.pts);

  // Ensure variety: all 3 picks should have different brands if possible
  if (scored.length >= 3 && scored[0].car.brand === scored[1].car.brand) {
    const altIdx = scored.findIndex((s, i) => i >= 2 && s.car.brand !== scored[0].car.brand);
    if (altIdx >= 0) {
      [scored[1], scored[altIdx]] = [scored[altIdx], scored[1]];
    }
  }
  if (scored.length >= 4) {
    const usedBrands = [scored[0].car.brand, scored[1].car.brand];
    if (usedBrands.includes(scored[2].car.brand)) {
      const altIdx = scored.findIndex((s, i) => i >= 3 && !usedBrands.includes(s.car.brand));
      if (altIdx >= 0) {
        [scored[2], scored[altIdx]] = [scored[altIdx], scored[2]];
      }
    }
  }

  const maxPts = 31;
  const topPicks = scored.slice(0, 3).map((s) => ({
    car: s.car,
    matchPercent: Math.min(99, Math.max(60, Math.round((s.pts / maxPts) * 100))),
  }));

  const profileParts: string[] = [];
  if (topUseCase === "city") profileParts.push("stadskörare");
  else if (topUseCase === "commuter") profileParts.push("pendlare");
  else if (topUseCase === "family") profileParts.push("familjebilist");
  else if (topUseCase === "adventure") profileParts.push("langresare");
  else if (topUseCase === "premium") profileParts.push("premiumsökare");
  if (topSize === "compact") profileParts.push("som gillar kompakta bilar");
  else if (topSize === "suv") profileParts.push("som vill ha SUV");
  else if (topSize === "premium") profileParts.push("som vill ha premium");
  else profileParts.push("som vill ha mellanklass");
  if (score.towbarRequired) profileParts.push("som behöver dragkrok");
  if (score.trunkImportant) profileParts.push("med stort lastutrymme");
  if (score.awdImportant) profileParts.push("med fyrhjulsdrift");

  let summary = `Du verkar vara en ${profileParts.join(" ")}. Här är våra rekommendationer:`;
  if (score.openToUsed) {
    summary += " Tips: Kolla även begagnatmarknaden – en 1–3 år gammal elbil kan ge mycket bil för pengarna.";
  }

  return { topPicks, profileSummary: summary, readyToBuy };
}
