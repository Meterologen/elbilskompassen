"use client";

import Link from "next/link";
import { useState } from "react";
import { COMPASS_QUESTIONS, getCompassResult, type CompassAnswer, type CompassResult } from "../lib/compass";
import { formatSek, brandFlag, type EvModel } from "../lib/cars";
import { LEASING_OFFERS, type LeasingOffer } from "../lib/leasing";

function findLeasingForCar(car: EvModel): LeasingOffer | null {
  const matches = LEASING_OFFERS.filter(
    (o) => o.brand.toLowerCase() === car.brand.toLowerCase()
  );
  if (matches.length === 0) return null;
  return matches.reduce((best, o) => (o.monthlyPrice < best.monthlyPrice ? o : best));
}

export default function KompassenPage() {
  const [answers, setAnswers] = useState<CompassAnswer[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState<CompassResult | null>(null);

  const total = COMPASS_QUESTIONS.length;
  const progress = Math.round((currentQ / total) * 100);

  const handleChoice = (choice: "A" | "B") => {
    const q = COMPASS_QUESTIONS[currentQ];
    const updated = [...answers, { questionId: q.id, choice }];
    setAnswers(updated);

    if (currentQ + 1 < total) {
      setCurrentQ(currentQ + 1);
    } else {
      setResult(getCompassResult(updated));
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setAnswers(answers.slice(0, -1));
      setCurrentQ(currentQ - 1);
    }
  };

  const restart = () => {
    setAnswers([]);
    setCurrentQ(0);
    setResult(null);
  };

  if (result) {
    return (
      <main id="main-content" className="min-h-screen" role="main">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold text-white">Din Elbilskompass</h1>
          <p className="mt-3 text-lg text-slate-200">{result.profileSummary}</p>

          <div className="mt-8 space-y-6">
            {result.topPicks.map(({ car, matchPercent }, i) => {
              const badgeColor =
                matchPercent > 85
                  ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
                  : matchPercent >= 70
                    ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
                    : "text-sky-300 border-sky-500/30 bg-sky-500/10";
              const label = i === 0 ? "Bästa matchning" : `Alternativ ${i}`;
              const leasing = findLeasingForCar(car);

              return (
                <div
                  key={car.id}
                  className={`overflow-hidden rounded-2xl border-2 bg-white/10 backdrop-blur-sm text-white ${
                    i === 0 ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-white/20"
                  }`}
                >
                  <div className={`px-4 py-1.5 text-center text-sm font-semibold text-white ${
                    i === 0 ? "bg-emerald-500" : "bg-slate-400"
                  }`}>
                    {label}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                          {brandFlag(car.brand) && (
                            <img src={`https://flagcdn.com/w40/${brandFlag(car.brand).toLowerCase()}.png`} alt={brandFlag(car.brand)} className="h-3.5 w-auto rounded-sm" />
                          )}
                          {car.brand}
                        </p>
                        <h2 className="text-xl font-bold text-white">{car.brand} {car.model}</h2>
                      </div>
                      <div className={`flex flex-col items-center rounded-full border-2 px-4 py-2 ${badgeColor}`}>
                        <span className="text-2xl font-bold leading-none">{matchPercent}%</span>
                        <span className="text-[10px] font-medium uppercase tracking-wide">matchning</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{car.description}</p>
                    <div className={`mt-4 grid grid-cols-2 gap-3 ${leasing ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
                      <div className="rounded-lg bg-white/5 p-3 text-center">
                        <p className="text-xs text-slate-400">Pris från</p>
                        <p className="font-semibold text-slate-200">{formatSek(car.priceSek)}</p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3 text-center">
                        <p className="text-xs text-slate-400">Räckvidd</p>
                        <p className="font-semibold text-slate-200">{car.rangeKm} km</p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3 text-center">
                        <p className="text-xs text-slate-400">Snabbladdning</p>
                        <p className="font-semibold text-slate-200">{car.fastChargeMin} min</p>
                      </div>
                      <div className="rounded-lg bg-white/5 p-3 text-center">
                        <p className="text-xs text-slate-400">Bagage</p>
                        <p className="font-semibold text-slate-200">{car.trunkLiters} L</p>
                      </div>
                      {leasing && (
                        <div className="rounded-lg bg-emerald-500/10 p-3 text-center">
                          <p className="text-xs text-emerald-400">Leasing från</p>
                          <p className="font-semibold text-emerald-300">{leasing.monthlyPrice.toLocaleString("sv-SE")} kr/mån</p>
                          {leasing.downPayment > 0 && (
                            <p className="mt-0.5 text-[10px] text-emerald-400">{leasing.downPayment.toLocaleString("sv-SE")} kr insats</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/modeller#${car.id}`}
                        className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
                      >
                        Läs mer om {car.model}
                      </Link>
                      <Link
                        href={`/kalkyl?evPrice=${car.priceSek}&evModel=${encodeURIComponent(car.brand + " " + car.model)}&evKwhPerMile=${car.kwhPerMile}`}
                        className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                      >
                        Räkna på {car.model}
                      </Link>
                      {leasing && (
                        <Link
                          href="/leasing"
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                        >
                          Leasa från {leasing.monthlyPrice.toLocaleString("sv-SE")} kr/mån →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center">
            <h2 className="text-xl font-bold text-white">
              {result.readyToBuy ? "Du verkar redo – ta nästa steg!" : "Vill du veta mer innan du bestämmer dig?"}
            </h2>
            <p className="mt-2 text-emerald-100">
              {result.readyToBuy
                ? "Boka provkörning eller begär en offert."
                : "Räkna på ekonomin eller läs hur andra gjort."}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {result.readyToBuy ? (
                <>
                  <Link href="/offert" className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">
                    Begär offert
                  </Link>
                  <Link href="/kalkyl" className="rounded-full border-2 border-white/80 px-6 py-3 font-semibold text-white hover:bg-white/10">
                    Räkna på ekonomin
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/kalkyl" className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">
                    Räkna på ekonomin
                  </Link>
                  <Link href="/berattelser" className="rounded-full border-2 border-white/80 px-6 py-3 font-semibold text-white hover:bg-white/10">
                    Läs andras berättelser
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button onClick={restart} className="text-sm text-sky-300 hover:text-sky-200 hover:underline">
              Gör om Elbilskompassen
            </button>
          </div>
        </div>
      </main>
    );
  }

  const q = COMPASS_QUESTIONS[currentQ];

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">← Startsida</Link>

        <h1 className="mt-6 text-2xl font-bold text-white">Elbilskompassen</h1>
        <p className="mt-1 text-slate-300">Fråga {currentQ + 1} av {total}</p>

        {/* Progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Fråga */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white">{q.question}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleChoice("A")}
              className="group rounded-2xl border-2 border-sky-300/30 bg-white/10 backdrop-blur-sm p-6 text-left transition hover:border-emerald-400/50 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <p className="font-semibold text-white group-hover:text-emerald-300">{q.optionA.label}</p>
              <p className="mt-2 text-sm text-slate-300">{q.optionA.description}</p>
            </button>
            <button
              type="button"
              onClick={() => handleChoice("B")}
              className="group rounded-2xl border-2 border-sky-300/30 bg-white/10 backdrop-blur-sm p-6 text-left transition hover:border-emerald-400/50 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <p className="font-semibold text-white group-hover:text-emerald-300">{q.optionB.label}</p>
              <p className="mt-2 text-sm text-slate-300">{q.optionB.description}</p>
            </button>
          </div>
        </div>

        {currentQ > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="mt-6 text-sm text-slate-400 hover:text-white"
          >
            ← Tillbaka till föregående fråga
          </button>
        )}
      </div>
    </main>
  );
}
