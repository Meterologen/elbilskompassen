"use client";

import Link from "next/link";
import { useState } from "react";
import { EV_MODELS, formatSek, type CarSize } from "../lib/cars";

const SIZE_LABELS: { value: CarSize | "all"; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "compact", label: "Kompakt" },
  { value: "medium", label: "Mellanklass" },
  { value: "suv", label: "SUV" },
  { value: "premium", label: "Premium" },
];

export default function ModellerPage() {
  const [sizeFilter, setSizeFilter] = useState<CarSize | "all">("all");
  const filtered = EV_MODELS.filter((c) => sizeFilter === "all" || c.size === sizeFilter).sort((a, b) => a.priceSek - b.priceSek);

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">← Startsida</Link>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Elbilar i Sverige</h1>
        <p className="mt-2 text-lg text-slate-200">Utforska {EV_MODELS.length} populära elbilar, sorterade efter pris.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {SIZE_LABELS.map((s) => (
            <button key={s.value} type="button" onClick={() => setSizeFilter(s.value)} className={`rounded-full px-5 py-2 text-sm font-medium transition ${sizeFilter === s.value ? "bg-emerald-500 text-white shadow-md" : "border border-sky-300/50 bg-white/10 text-slate-200 hover:bg-white/20"}`}>{s.label}</button>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-400">Visar {filtered.length} av {EV_MODELS.length} modeller</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((car) => (
            <div key={car.id} id={car.id} className="flex flex-col rounded-2xl border border-sky-300/40 bg-white/95 shadow-sm">
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{car.brand}</p>
                    <h2 className="text-lg font-bold text-slate-900">{car.brand} {car.model}</h2>
                  </div>
                  <span className="text-3xl">{car.emoji}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{car.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-center"><p className="text-[11px] text-slate-500">Pris</p><p className="font-semibold text-slate-800">{formatSek(car.priceSek)}</p></div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-center"><p className="text-[11px] text-slate-500">Räckvidd</p><p className="font-semibold text-slate-800">{car.rangeKm} km</p></div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-center"><p className="text-[11px] text-slate-500">Batteri</p><p className="font-semibold text-slate-800">{car.batteryKwh} kWh</p></div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-center"><p className="text-[11px] text-slate-500">Snabbladdning</p><p className="font-semibold text-slate-800">{car.fastChargeMin} min</p></div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-center"><p className="text-[11px] text-slate-500">Bagage</p><p className="font-semibold text-slate-800">{car.trunkLiters} L</p></div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-center"><p className="text-[11px] text-slate-500">Platser</p><p className="font-semibold text-slate-800">{car.seats} st</p></div>
                </div>
              </div>
              <div className="border-t border-slate-100 px-6 py-4">
                <Link href={`/kalkyl?evPrice=${car.priceSek}&evModel=${encodeURIComponent(car.brand + " " + car.model)}&evKwhPerMile=${car.kwhPerMile}`} className="block rounded-full bg-sky-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-sky-500">Räkna på {car.model}</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Osäker på vilken som passar dig?</h2>
          <p className="mt-2 text-emerald-100">Svara på 10 frågor så matchar vi dig med rätt elbil.</p>
          <Link href="/kompassen" className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">Starta Elbilskompassen</Link>
        </div>
      </div>
    </main>
  );
}
