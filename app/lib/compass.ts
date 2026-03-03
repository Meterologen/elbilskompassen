/**
 * Elbilskompassen – 10 frågor som kartlägger vad användaren behöver.
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
    question: "Vad är viktigast för dig?",
    optionA: { label: "Lågt pris", description: "Jag vill ha en bra elbil utan att det kostar skjortan." },
    optionB: { label: "Premiumkänsla", description: "Komfort, design och teknik är värt att betala extra för." },
  },
  {
    id: 4,
    question: "Hur långt kör du normalt på en dag?",
    optionA: { label: "Under 5 mil", description: "Sällan mer än 50 km per dag." },
    optionB: { label: "Ofta över 5 mil", description: "Jag kör regelbundet 50–150+ km per dag." },
  },
  {
    id: 5,
    question: "Kan du ladda hemma?",
    optionA: { label: "Ja – villa/radhus/parkering med el", description: "Jag kan installera eller har redan en laddbox." },
    optionB: { label: "Nej – beroende av publik laddning", description: "Lägenhet eller parkering utan elmöjlighet." },
  },
  {
    id: 6,
    question: "Planerar du långa resor (semesterkörning)?",
    optionA: { label: "Sällan – vi flyger/tågar", description: "Bilen används mest lokalt." },
    optionB: { label: "Ja – vi kör till fjällen/Europa", description: "Lång räckvidd och snabb laddning viktigt." },
  },
  {
    id: 7,
    question: "Vad oroar dig mest med elbil?",
    optionA: { label: "Att det blir för dyrt", description: "Inköpspris och totalekonomi väger tyngst." },
    optionB: { label: "Att räckvidden inte räcker", description: "Jag vill inte behöva tänka på laddning hela tiden." },
  },
  {
    id: 8,
    question: "Hur viktig är snabb laddning?",
    optionA: { label: "Inte jätteviktigt", description: "Jag laddar mest hemma över natten." },
    optionB: { label: "Mycket viktigt", description: "Jag vill kunna snabbladda på 20–30 min vid långresa." },
  },
  {
    id: 9,
    question: "Åker ni ofta fler än 4 personer?",
    optionA: { label: "Nej – max 4", description: "Vi är 1–4 i bilen normalt." },
    optionB: { label: "Ja – ibland 5–7", description: "Vi behöver plats för stor familj eller vänner." },
  },
  {
    id: 10,
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
  };

  for (const a of answers) {
    const c = a.choice;
    switch (a.questionId) {
      case 1: // Stadskörning vs landsväg
        if (c === "A") { score.useCase.city += 3; score.size.compact += 2; }
        else { score.useCase.commuter += 3; score.rangeMin = Math.max(score.rangeMin, 450); }
        break;
      case 2: // Liten vs rymlig
        if (c === "A") { score.size.compact += 3; score.size.medium += 1; }
        else { score.size.suv += 3; score.useCase.family += 2; }
        break;
      case 3: // Lågt pris vs premium
        if (c === "A") { score.budgetMax = 400_000; score.size.compact += 1; }
        else { score.size.premium += 3; score.useCase.premium += 3; score.budgetMax = 900_000; }
        break;
      case 4: // Under 5 mil vs över
        if (c === "A") { score.useCase.city += 2; }
        else { score.useCase.commuter += 2; score.rangeMin = Math.max(score.rangeMin, 480); }
        break;
      case 5: // Ladda hemma vs publik
        if (c === "B") { score.rangeMin = Math.max(score.rangeMin, 450); score.fastChargeImportant = true; }
        break;
      case 6: // Sällan långresa vs ja
        if (c === "B") { score.rangeMin = Math.max(score.rangeMin, 500); score.useCase.adventure += 3; score.fastChargeImportant = true; }
        break;
      case 7: // Oro: pris vs räckvidd
        if (c === "A") { score.budgetMax = Math.min(score.budgetMax, 450_000); }
        else { score.rangeMin = Math.max(score.rangeMin, 500); }
        break;
      case 8: // Snabb laddning
        if (c === "B") { score.fastChargeImportant = true; }
        break;
      case 9: // Fler än 4 personer
        if (c === "B") { score.seatsMin = 7; score.size.premium += 2; score.size.suv += 1; }
        break;
      case 10: // Hur snart
        break;
    }
  }
  return score;
}

export interface CompassResult {
  topPicks: EvModel[];
  profileSummary: string;
  readyToBuy: boolean;
}

export function getCompassResult(answers: CompassAnswer[]): CompassResult {
  const score = buildScore(answers);
  const readyToBuy = answers.find((a) => a.questionId === 10)?.choice === "A";

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
    return { car, pts };
  });

  scored.sort((a, b) => b.pts - a.pts);
  const topPicks = scored.slice(0, 3).map((s) => s.car);

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

  const profileSummary = `Du verkar vara en ${profileParts.join(" ")}. Här är våra rekommendationer:`;

  return { topPicks, profileSummary, readyToBuy };
}
