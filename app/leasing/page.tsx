"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { LEASING_OFFERS, getLeasingPeriod, LEASING_SOURCE_NOTE, type LeasingOffer } from "../lib/leasing";

function fmtSek(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(n);
}

type SortKey = "price" | "range" | "brand" | "size";
type SizeFilter = "all" | "compact" | "medium" | "suv" | "premium";

const SIZE_LABELS: Record<string, string> = {
  all: "Alla",
  compact: "Kompakt",
  medium: "Mellanklass",
  suv: "SUV",
  premium: "Premium",
};

function includedBadge(yes: boolean, label: string) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        yes ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {yes ? `${label} ingår` : `${label} ej inkl.`}
    </span>
  );
}

export default function LeasingPage() {
  const [sort, setSort] = useState<SortKey>("price");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [maxPrice, setMaxPrice] = useState(10_000);
  const leasingPeriod = useMemo(() => getLeasingPeriod(), []);

  const filtered = useMemo(() => {
    let list = LEASING_OFFERS.filter((o) => o.monthlyPrice <= maxPrice);
    if (sizeFilter !== "all") list = list.filter((o) => o.size === sizeFilter);
    list.sort((a, b) => {
      if (sort === "price") return a.monthlyPrice - b.monthlyPrice;
      if (sort === "range") return b.rangeKm - a.rangeKm;
      if (sort === "brand") return a.brand.localeCompare(b.brand);
      if (sort === "size") return a.size.localeCompare(b.size);
      return 0;
    });
    return list;
  }, [sort, sizeFilter, maxPrice]);

  const pct = ((maxPrice - 2000) / (10000 - 2000)) * 100;

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-sky-300 hover:text-sky-200 hover:underline">Startsida</Link>
          <Link href="/kalkyl" className="text-sky-300 hover:text-sky-200 hover:underline">Räkna på det</Link>
        </nav>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Privatleasing – faktiska erbjudanden</h1>
          <p className="mt-2 text-lg text-slate-200">
            Riktiga priser från svenska återförsäljare. Erbjudanden från {leasingPeriod}.
          </p>
        </div>

        {/* Transparency note */}
        <div className="mt-6 rounded-xl border border-sky-300/30 bg-white/5 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">&#9432;</span>
            <div className="text-sm text-slate-300">
              <p className="font-medium text-white">Trovärdig och transparent</p>
              <p className="mt-1">{LEASING_SOURCE_NOTE}</p>
              <p className="mt-1">
                Varje erbjudande har en källhänvisning du kan klicka på för att verifiera priset.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Filtrera och sortera</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            {/* Max price slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Max pris</span>
                <span className="rounded-full bg-sky-100 px-3 py-0.5 text-sm font-semibold text-sky-800">
                  {fmtSek(maxPrice)} kr/mån
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={10000}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="slider-input w-full"
                style={{
                  background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
                }}
              />
            </div>

            {/* Size filter */}
            <div className="space-y-2">
              <span className="text-sm text-slate-700">Storlek</span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(SIZE_LABELS) as SizeFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSizeFilter(s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      sizeFilter === s
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {SIZE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <span className="text-sm text-slate-700">Sortera efter</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="price">Lägst pris</option>
                <option value="range">Längst räckvidd</option>
                <option value="brand">Märke (A-Ö)</option>
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Visar {filtered.length} av {LEASING_OFFERS.length} erbjudanden
          </p>
        </div>

        {/* Offers grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-sky-300/40 bg-white/95 p-8 text-center">
              <p className="text-slate-600">Inga erbjudanden matchar dina filter. Prova att höja maxpriset.</p>
            </div>
          )}
        </div>

        {/* Tips section */}
        <div className="mt-12 rounded-2xl border border-sky-300/40 bg-white/95 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Tips vid privatleasing</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-800">Vad ingår?</h3>
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Service och garanti ingår oftast
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  Försäkring ingår sällan – räkna med +500–1 000 kr/mån
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  Vinterdäck ingår sällan – räkna med +200–600 kr/mån
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Fordonsskatt: 360 kr/år för alla elbilar
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Tänk på</h3>
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  Kolla övermilsavgift (5–20 kr/mil extra)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  Jämför alltid totalkostnad, inte bara månadspris
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  Fast eller rörlig ränta? Läs avtalet noga
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  Köp vinterdäck separat – ofta billigare
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white">Vill du jämföra med att köpa?</h2>
          <p className="mt-2 text-emerald-100">Vår TCO-kalkylator visar vad det faktiskt kostar att äga en elbil vs fossilbil.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/kalkyl" className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">
              Räkna på ekonomin
            </Link>
            <Link href="/kompassen" className="rounded-full border-2 border-white/80 px-6 py-3 font-semibold text-white hover:bg-white/10">
              Starta Elbilskompassen
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function OfferCard({ offer: o }: { offer: LeasingOffer }) {
  return (
    <div className="flex flex-col rounded-2xl border border-sky-300/40 bg-white/95 p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{o.brand}</p>
          <p className="text-lg font-bold text-slate-900">{o.model} {o.trim}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
          {fmtSek(o.monthlyPrice)} kr
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <span>Räckvidd: {o.rangeKm} km</span>
        <span>Batteri: {o.batteryKwh} kWh</span>
        <span>{o.contractMonths} mån</span>
        <span>{fmtSek(o.annualMileage)} mil/år</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {includedBadge(o.serviceIncluded, "Service")}
        {includedBadge(o.winterTiresIncluded, "Vinterdäck")}
        {includedBadge(o.insuranceIncluded, "Försäkring")}
      </div>

      {o.note && (
        <p className="mt-2 text-xs italic text-slate-500">{o.note}</p>
      )}

      <div className="mt-auto pt-4">
        <a
          href={o.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-500 hover:underline"
        >
          Källa: {o.source}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
            <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
