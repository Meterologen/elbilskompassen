"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  MUNICIPALITY_NAMES,
  MUNICIPALITY_STATUS,
  INCOME_LIMITS,
  PRICE_LIMITS,
  PREMIUM_AMOUNTS,
  checkEligibility,
  type PremiumAnswers,
  type EligibilityResult,
  type MunicipalityStatus,
} from "../lib/premium-data";

/* ─── constants ─────────────────────────────────────────────────── */
const TOTAL_STEPS = 5;

/* ─── helpers ───────────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString("sv-SE");
}

/* ─── component ─────────────────────────────────────────────────── */
export default function ElbilspremiePage() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<EligibilityResult | null>(null);

  // Answers
  const [municipality, setMunicipality] = useState("");
  const [municipalitySearch, setMunicipalitySearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [householdType, setHouseholdType] = useState<"single" | "couple" | "">(
    ""
  );
  const [income, setIncome] = useState(250_000);
  const [hadEvBefore, setHadEvBefore] = useState<boolean | null>(null);
  const [purchaseType, setPurchaseType] = useState<"buy" | "lease" | "">(
    ""
  );
  const [price, setPrice] = useState(0);

  // Filtered municipalities
  const filteredMunicipalities = useMemo(() => {
    if (!municipalitySearch) return MUNICIPALITY_NAMES.slice(0, 20);
    const q = municipalitySearch.toLowerCase();
    return MUNICIPALITY_NAMES.filter((m) => m.toLowerCase().includes(q)).slice(
      0,
      20
    );
  }, [municipalitySearch]);

  // Municipality status for immediate feedback
  const munStatus: MunicipalityStatus | undefined =
    MUNICIPALITY_STATUS[municipality];

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      // Calculate result
      const answers: PremiumAnswers = {
        municipality,
        householdType: householdType as "single" | "couple",
        income,
        hadEvBefore: hadEvBefore!,
        purchaseType: purchaseType as "buy" | "lease",
        price,
      };
      setResult(checkEligibility(answers));
      setStep(TOTAL_STEPS + 1);
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleRestart() {
    setStep(1);
    setResult(null);
    setMunicipality("");
    setMunicipalitySearch("");
    setHouseholdType("");
    setIncome(250_000);
    setHadEvBefore(null);
    setPurchaseType("");
    setPrice(0);
  }

  // Can proceed?
  const canProceed = (() => {
    switch (step) {
      case 1:
        return municipality !== "" && munStatus !== "excluded";
      case 2:
        return householdType !== "";
      case 3:
        return income > 0;
      case 4:
        return hadEvBefore !== null;
      case 5:
        return purchaseType !== "" && price > 0;
      default:
        return false;
    }
  })();

  // ─── Result view ──────────────────────────────────────────────
  if (result) {
    return (
      <main id="main-content" className="min-h-screen" role="main">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <Link
            href="/"
            className="text-sm text-sky-300 hover:text-sky-200 hover:underline"
          >
            &larr; Startsida
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Elbilspremie-kollen
          </h1>

          {result.eligible ? (
            <div className="mt-8 rounded-2xl border-2 border-emerald-400 bg-white/10 backdrop-blur-sm p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-xl">
                  &#10003;
                </span>
                <h2 className="text-xl font-bold text-emerald-300 sm:text-2xl">
                  Du verkar ha rätt till elbilspremien!
                </h2>
              </div>
              <div className="mt-6 rounded-xl bg-emerald-500/10 p-4">
                <p className="text-sm font-medium text-emerald-300">
                  Beräknat premiebelopp
                </p>
                <p className="mt-1 text-3xl font-bold text-emerald-300">
                  {fmt(result.amount)} kr
                </p>
                {result.hasStartBonus && (
                  <p className="mt-2 text-sm text-emerald-300">
                    Inkluderar starttillägg på{" "}
                    {fmt(PREMIUM_AMOUNTS.startBonus)} kr (lägre inkomst ger
                    extra stöd).
                  </p>
                )}
                {!result.hasStartBonus && (
                  <p className="mt-2 text-sm text-emerald-300">
                    Grundpremie: {fmt(PREMIUM_AMOUNTS.base)} kr (1 300 kr/mån i
                    upp till 36 månader).
                  </p>
                )}
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <p>
                  <strong>Kommun:</strong> {municipality}{" "}
                  {munStatus === "partial" && "(delvis kvalificerande)"}
                </p>
                <p>
                  <strong>Hushåll:</strong>{" "}
                  {householdType === "single" ? "Ensamboende" : "Sambo/gift"}
                </p>
                <p>
                  <strong>Inkomst:</strong> {fmt(income)} kr/år
                </p>
                <p>
                  <strong>
                    {purchaseType === "buy" ? "Köppris" : "Leasingkostnad"}:
                  </strong>{" "}
                  {fmt(price)} {purchaseType === "lease" ? "kr/mån" : "kr"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border-2 border-red-400/50 bg-white/10 backdrop-blur-sm p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-xl">
                  &#10007;
                </span>
                <h2 className="text-xl font-bold text-red-300 sm:text-2xl">
                  Tyvärr uppfyller du inte kraven
                </h2>
              </div>
              <div className="mt-6 space-y-3">
                {result.reasons.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
                  >
                    <span className="mt-0.5 shrink-0">&#8226;</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 rounded-xl border border-sky-300/40 bg-white/5 p-4 text-xs text-slate-400">
            <strong>Observera:</strong> Detta verktyg ger en uppskattning baserad
            på de regler som presenteras av Naturvårdsverket. Det slutgiltiga
            beslutet fattas av Naturvårdsverket vid ansökan. Ytterligare villkor
            kan gälla, t.ex. krav på personnummer, ålder (18+) och avsaknad av
            fordonsrelaterade skulder hos Kronofogden.
            <br />
            <a
              href="https://www.naturvardsverket.se/elbilspremie"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-medium text-sky-400 hover:underline"
            >
              Läs mer och ansök hos Naturvårdsverket &rarr;
            </a>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleRestart}
              className="rounded-full border-2 border-sky-300/60 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Testa igen
            </button>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Redo att hitta din elbil?
            </h2>
            <p className="mt-2 text-emerald-100">
              Använd våra verktyg för att hitta rätt bil och bästa erbjudandet.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/kompassen"
                className="rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50"
              >
                Hitta rätt elbil
              </Link>
              <Link
                href="/leasing"
                className="rounded-full border-2 border-white/80 px-8 py-3 font-semibold text-white hover:bg-white/10"
              >
                Jämför leasingerbjudanden
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─── Form view ────────────────────────────────────────────────
  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="text-sm text-sky-300 hover:text-sky-200 hover:underline"
        >
          &larr; Startsida
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
          Elbilspremie-kollen
        </h1>
        <p className="mt-2 text-lg text-slate-200">
          Kolla om du kan ha rätt till den nya elbilspremien som lanseras 18
          mars 2026.
        </p>

        {/* Progress bar */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-slate-300">
            Steg {step} av {TOTAL_STEPS}
          </span>
        </div>

        {/* Step card */}
        <div className="mt-6 rounded-2xl border border-sky-300/40 bg-white/10 backdrop-blur-sm p-6 sm:p-8">
          {/* ─── Step 1: Municipality ─── */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-white">
                Vilken kommun bor du i?
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Elbilspremien gäller främst i landsbygdskommuner och kommuner
                med begränsad kollektivtrafik.
              </p>
              <div className="relative mt-4">
                <input
                  type="text"
                  value={municipality || municipalitySearch}
                  onChange={(e) => {
                    setMunicipalitySearch(e.target.value);
                    setMunicipality("");
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Sök kommun..."
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                />
                {showDropdown && !municipality && (
                  <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-white/20 bg-slate-800 shadow-lg">
                    {filteredMunicipalities.length === 0 ? (
                      <li className="px-4 py-2 text-sm text-slate-400">
                        Ingen kommun hittades
                      </li>
                    ) : (
                      filteredMunicipalities.map((m) => (
                        <li key={m}>
                          <button
                            type="button"
                            onClick={() => {
                              setMunicipality(m);
                              setMunicipalitySearch("");
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-sky-300"
                          >
                            {m}
                            <span className="ml-2 text-xs text-slate-400">
                              {MUNICIPALITY_STATUS[m] === "eligible"
                                ? "Landsbygd"
                                : MUNICIPALITY_STATUS[m] === "partial"
                                  ? "Blandad"
                                  : "Storstad"}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {/* Feedback for selected municipality */}
              {municipality && munStatus === "excluded" && (
                <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                  Tyvärr ingår {municipality} inte bland de kommuner som
                  omfattas av elbilspremien.
                </div>
              )}
              {municipality && munStatus === "eligible" && (
                <div className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  {municipality} är en landsbygdskommun som kvalificerar.
                </div>
              )}
              {municipality && munStatus === "partial" && (
                <div className="mt-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-300">
                  {municipality} har delar med begränsad kollektivtrafik som kan
                  kvalificera. Exakt behörighet beror på var i kommunen du bor.
                </div>
              )}
            </div>
          )}

          {/* ─── Step 2: Household type ─── */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-white">
                Hur ser ditt hushåll ut?
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Inkomstgränsen beror på om du bor ensam eller med sambo/partner.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setHouseholdType("single")}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    householdType === "single"
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <span className="text-2xl">&#128100;</span>
                  <p className="mt-2 font-semibold text-white">
                    Ensamboende
                  </p>
                  <p className="text-sm text-slate-400">
                    Inkomstgräns: {fmt(INCOME_LIMITS.singleMax)} kr/år
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setHouseholdType("couple")}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    householdType === "couple"
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <span className="text-2xl">&#128101;</span>
                  <p className="mt-2 font-semibold text-white">
                    Sambo / gift
                  </p>
                  <p className="text-sm text-slate-400">
                    Inkomstgräns: {fmt(INCOME_LIMITS.coupleMax)} kr/år
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Income ─── */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-white">
                Hushållets totala årsinkomst?
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Ange hushållets samlade inkomst före skatt.
                {householdType === "single"
                  ? ` Gränsen för ensamboende är ${fmt(INCOME_LIMITS.singleMax)} kr/år.`
                  : ` Gränsen för sambo/gift är ${fmt(INCOME_LIMITS.coupleMax)} kr/år.`}
              </p>
              <div className="mt-6">
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">
                    {fmt(income)} kr
                  </span>
                  <span className="ml-1 text-sm text-slate-400">/år</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={800_000}
                  step={5_000}
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="slider-input mt-4 w-full"
                  style={{
                    background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${(income / 800_000) * 100}%, #334155 ${(income / 800_000) * 100}%, #334155 100%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>0 kr</span>
                  <span>800 000 kr</span>
                </div>
              </div>
              {/* Income feedback */}
              {income > 0 && (
                <div className="mt-4">
                  {income <=
                  (householdType === "single"
                    ? INCOME_LIMITS.singleStartBonus
                    : INCOME_LIMITS.coupleStartBonus) ? (
                    <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
                      Din inkomst kvalificerar för både grundpremie och
                      starttillägg (totalt {fmt(PREMIUM_AMOUNTS.max)} kr).
                    </div>
                  ) : income <=
                    (householdType === "single"
                      ? INCOME_LIMITS.singleMax
                      : INCOME_LIMITS.coupleMax) ? (
                    <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
                      Din inkomst kvalificerar för grundpremien (
                      {fmt(PREMIUM_AMOUNTS.base)} kr).
                    </div>
                  ) : (
                    <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                      Inkomsten överstiger gränsen.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Step 4: Previous EV ─── */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold text-white">
                Har du ägt eller leasat en elbil/laddhybrid?
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Ingen i hushållet får ha ägt eller leasat en elbil eller
                laddhybrid de senaste 12 månaderna.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setHadEvBefore(false)}
                  className={`rounded-xl border-2 p-4 text-center transition ${
                    hadEvBefore === false
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <p className="font-semibold text-white">
                    Nej, inte senaste 12 månaderna
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setHadEvBefore(true)}
                  className={`rounded-xl border-2 p-4 text-center transition ${
                    hadEvBefore === true
                      ? "border-red-400 bg-red-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <p className="font-semibold text-white">
                    Ja, de senaste 12 månaderna
                  </p>
                </button>
              </div>
              {hadEvBefore === true && (
                <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                  Tyvärr, detta diskvalificerar från elbilspremien.
                </div>
              )}
            </div>
          )}

          {/* ─── Step 5: Price ─── */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold text-white">
                Bilens pris
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Elbilspremien gäller rena elbilar (ej laddhybrider).
              </p>

              {/* Buy or Lease toggle */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseType("buy");
                    setPrice(250_000);
                  }}
                  className={`rounded-xl border-2 p-4 text-center transition ${
                    purchaseType === "buy"
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <p className="font-semibold text-white">Köpa</p>
                  <p className="text-sm text-slate-400">
                    {fmt(PRICE_LIMITS.purchaseMin)}–
                    {fmt(PRICE_LIMITS.purchaseMax)} kr
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseType("lease");
                    setPrice(3_000);
                  }}
                  className={`rounded-xl border-2 p-4 text-center transition ${
                    purchaseType === "lease"
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <p className="font-semibold text-white">Leasa</p>
                  <p className="text-sm text-slate-400">
                    {fmt(PRICE_LIMITS.leaseMin)}–{fmt(PRICE_LIMITS.leaseMax)}{" "}
                    kr/mån
                  </p>
                </button>
              </div>

              {/* Price slider */}
              {purchaseType === "buy" && (
                <div className="mt-6">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">
                      {fmt(price)} kr
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={600_000}
                    step={5_000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="slider-input mt-4 w-full"
                    style={{
                      background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${(price / 600_000) * 100}%, #334155 ${(price / 600_000) * 100}%, #334155 100%)`,
                    }}
                  />
                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>0 kr</span>
                    <span>600 000 kr</span>
                  </div>
                  {price > 0 &&
                    (price < PRICE_LIMITS.purchaseMin ||
                      price > PRICE_LIMITS.purchaseMax) && (
                      <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                        Priset ska vara mellan {fmt(PRICE_LIMITS.purchaseMin)}{" "}
                        och {fmt(PRICE_LIMITS.purchaseMax)} kr.
                      </div>
                    )}
                  {price >= PRICE_LIMITS.purchaseMin &&
                    price <= PRICE_LIMITS.purchaseMax && (
                      <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
                        Priset uppfyller kraven.
                      </div>
                    )}
                </div>
              )}

              {purchaseType === "lease" && (
                <div className="mt-6">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">
                      {fmt(price)} kr
                    </span>
                    <span className="ml-1 text-sm text-slate-400">/mån</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={8_000}
                    step={100}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="slider-input mt-4 w-full"
                    style={{
                      background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${(price / 8_000) * 100}%, #334155 ${(price / 8_000) * 100}%, #334155 100%)`,
                    }}
                  />
                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>0 kr</span>
                    <span>8 000 kr</span>
                  </div>
                  {price > 0 &&
                    (price < PRICE_LIMITS.leaseMin ||
                      price > PRICE_LIMITS.leaseMax) && (
                      <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                        Leasingkostnaden ska vara mellan{" "}
                        {fmt(PRICE_LIMITS.leaseMin)} och{" "}
                        {fmt(PRICE_LIMITS.leaseMax)} kr/mån.
                      </div>
                    )}
                  {price >= PRICE_LIMITS.leaseMin &&
                    price <= PRICE_LIMITS.leaseMax && (
                      <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
                        Leasingkostnaden uppfyller kraven.
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-white/10"
              >
                &larr; Tillbaka
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className="rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === TOTAL_STEPS ? "Se resultat" : "Nästa"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
