"use client";

import Link from "next/link";
import { useState } from "react";
import { COMPASS_QUESTIONS, getCompassResult, type CompassAnswer, type CompassResult } from "../lib/compass";
import { formatSek } from "../lib/cars";

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
            {result.topPicks.map((car, i) => (
              <div
                key={car.id}
                className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm text-slate-900 ${
                  i === 0 ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"
                }`}
              >
                {i === 0 && (
                  <div className="bg-emerald-500 px-4 py-1.5 text-center text-sm font-semibold text-white">
                    Bästa matchning
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{car.brand}</p>
                      <h2 className="text-xl font-bold text-slate-900">{car.brand} {car.model}</h2>
                    </div>
                    <span className="text-3xl">{car.emoji}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{car.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-xs text-slate-500">Pris från</p>
                      <p className="font-semibold text-slate-800">{formatSek(car.priceSek)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-xs text-slate-500">Räckvidd</p>
                      <p className="font-semibold text-slate-800">{car.rangeKm} km</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-xs text-slate-500">Snabbladdning</p>
                      <p className="font-semibold text-slate-800">{car.fastChargeMin} min</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3 text-center">
                      <p className="text-xs text-slate-500">Bagage</p>
                      <p className="font-semibold text-slate-800">{car.trunkLiters} L</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/modeller#${car.id}`}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Läs mer om {car.model}
                    </Link>
                    <Link
                      href={`/kalkyl?evPrice=${car.priceSek}&evModel=${encodeURIComponent(car.brand + " " + car.model)}&evKwhPerMile=${car.kwhPerMile}`}
                      className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                    >
                      Räkna på {car.model}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
                  <button className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">
                    Begär offert (kommer snart)
                  </button>
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
              className="group rounded-2xl border-2 border-sky-300/50 bg-white p-6 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <p className="font-semibold text-slate-900 group-hover:text-emerald-700">{q.optionA.label}</p>
              <p className="mt-2 text-sm text-slate-600">{q.optionA.description}</p>
            </button>
            <button
              type="button"
              onClick={() => handleChoice("B")}
              className="group rounded-2xl border-2 border-sky-300/50 bg-white p-6 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <p className="font-semibold text-slate-900 group-hover:text-emerald-700">{q.optionB.label}</p>
              <p className="mt-2 text-sm text-slate-600">{q.optionB.description}</p>
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
