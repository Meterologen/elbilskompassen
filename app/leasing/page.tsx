"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { LEASING_OFFERS, getLeasingPeriod, LEASING_SOURCE_NOTE, type LeasingOffer } from "../lib/leasing";
import { brandFlag } from "../lib/cars";

function fmtSek(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(n);
}

const EST_WINTER_TIRES = 350; // kr/mån
const EST_INSURANCE = 800;    // kr/mån

function estimatedTotal(o: LeasingOffer) {
  let total = o.monthlyPrice;
  if (!o.winterTiresIncluded) total += EST_WINTER_TIRES;
  if (!o.insuranceIncluded) total += EST_INSURANCE;
  return total;
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        yes ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30" : "bg-white/5 text-slate-500 ring-1 ring-white/10"
      }`}
    >
      {yes ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      )}
      {label}
    </span>
  );
}

export default function LeasingPage() {
  const [sort, setSort] = useState<SortKey>("price");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [minPrice, setMinPrice] = useState(2_000);
  const [maxPrice, setMaxPrice] = useState(15_000);
  const [zeroDownOnly, setZeroDownOnly] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [trustOpen, setTrustOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const leasingPeriod = useMemo(() => getLeasingPeriod(), []);

  const brands = useMemo(() => {
    const unique = [...new Set(LEASING_OFFERS.map((o) => o.brand))].sort();
    return ["all", ...unique];
  }, []);

  const filtered = useMemo(() => {
    let list = LEASING_OFFERS.filter(
      (o) => o.monthlyPrice >= minPrice && o.monthlyPrice <= maxPrice
    );
    if (sizeFilter !== "all") list = list.filter((o) => o.size === sizeFilter);
    if (brandFilter !== "all") list = list.filter((o) => o.brand === brandFilter);
    if (zeroDownOnly) list = list.filter((o) => o.downPayment === 0);
    list.sort((a, b) => {
      if (sort === "price") return a.monthlyPrice - b.monthlyPrice;
      if (sort === "range") return b.rangeKm - a.rangeKm;
      if (sort === "brand") return a.brand.localeCompare(b.brand);
      if (sort === "size") return a.size.localeCompare(b.size);
      return 0;
    });
    return list;
  }, [sort, sizeFilter, brandFilter, minPrice, maxPrice, zeroDownOnly]);

  const minPct = ((minPrice - 2000) / (15000 - 2000)) * 100;
  const maxPct = ((maxPrice - 2000) / (15000 - 2000)) * 100;

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
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

        {/* Så funkar leasing */}
        <section className="mt-10 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setGuideOpen(!guideOpen)}
            className="flex w-full items-center justify-between gap-4 p-6 text-left sm:px-8"
          >
            <div>
              <h2 className="text-xl font-bold text-white">Så funkar privatleasing</h2>
              <p className="mt-1 text-sm text-slate-400">Lär dig skillnaden mellan operationell och finansiell leasing, och vad som ingår.</p>
            </div>
            <svg
              className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${guideOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {guideOpen && (
          <div className="border-t border-white/10 px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
            <p className="text-sm leading-relaxed text-slate-300">
              Vid privatleasing hyr du bilen under en bestämd period (vanligtvis 24–36 månader) och lämnar sedan tillbaka den. Du äger aldrig bilen – istället betalar du en fast månadskostnad som täcker värdeminskning, ränta och ofta service.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Operationell leasing */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <h3 className="font-semibold text-emerald-300">Operationell leasing</h3>
              <p className="mt-1 text-xs font-medium text-emerald-400">Vanligast vid privatleasing</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Du hyr bilen – leasingbolaget äger den
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Fast månadskostnad, ofta inklusive service och vägassistans
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Lämnar tillbaka bilen efter avtalsperioden
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  Ingen risk för värdeminskning – det är leasingbolagets problem
                </li>
              </ul>
            </div>

            {/* Finansiell leasing */}
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">
              <h3 className="font-semibold text-sky-300">Finansiell leasing</h3>
              <p className="mt-1 text-xs font-medium text-sky-400">Vanligast bland företag</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Mer som ett avbetalningsköp – du tar restvärdesrisken
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Oftast lägre månadskostnad, men fler kostnader tillkommer
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Du kan köpa ut bilen när avtalet löper ut
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Service och försäkring ingår sällan
                </li>
              </ul>
            </div>
          </div>

          {/* Vad ingår / ingår inte */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold text-white">Brukar ingå</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Service och underhåll
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Fabriksgaranti (ofta hela leasingperioden)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Vägassistans
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Fordonsskatt (360 kr/år för elbilar)
                </li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold text-white">Brukar inte ingå</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Försäkring (+500–1 000 kr/mån)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Vinterdäck (+200–600 kr/mån)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Hemmaladdning / laddbox
                </li>
                <li className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Övermilsavgift (5–20 kr/mil utöver avtalad miltal)
                </li>
              </ul>
            </div>
          </div>
          </div>
          )}
        </section>

        {/* Transparency note */}
        <div className="mt-6 rounded-xl border border-sky-300/30 bg-white/5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setTrustOpen(!trustOpen)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">&#9432;</span>
              <span className="text-sm font-medium text-white">Trovärdig och transparent</span>
            </div>
            <svg
              className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${trustOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {trustOpen && (
            <div className="border-t border-white/10 px-5 pb-4 pt-3 text-sm text-slate-300">
              <p>{LEASING_SOURCE_NOTE}</p>
              <p className="mt-1">
                Varje erbjudande har en källhänvisning du kan klicka på för att verifiera priset.
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex w-full items-center justify-between gap-4 p-6 text-left"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-white">Filtrera och sortera</h2>
              <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-medium text-sky-300">
                {filtered.length} av {LEASING_OFFERS.length}
              </span>
            </div>
            <svg
              className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {filtersOpen && (
          <div className="border-t border-white/10 px-6 pb-6 pt-4">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Price range */}
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Prisintervall</span>
                <span className="rounded-full bg-sky-500/20 px-3 py-0.5 text-sm font-semibold text-sky-300">
                  {fmtSek(minPrice)} – {fmtSek(maxPrice)} kr/mån
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 text-xs text-slate-400">Min</span>
                  <input
                    type="range"
                    min={2000}
                    max={15000}
                    step={100}
                    value={minPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMinPrice(Math.min(v, maxPrice - 100));
                    }}
                    className="slider-input w-full"
                    style={{
                      background: `linear-gradient(to right, #334155 0%, #334155 ${minPct}%, #0ea5e9 ${minPct}%, #0ea5e9 ${maxPct}%, #334155 ${maxPct}%, #334155 100%)`,
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-xs text-slate-400">Max</span>
                  <input
                    type="range"
                    min={2000}
                    max={15000}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMaxPrice(Math.max(v, minPrice + 100));
                    }}
                    className="slider-input w-full"
                    style={{
                      background: `linear-gradient(to right, #334155 0%, #334155 ${minPct}%, #0ea5e9 ${minPct}%, #0ea5e9 ${maxPct}%, #334155 ${maxPct}%, #334155 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Size filter */}
            <div className="space-y-2">
              <span className="text-sm text-slate-300">Storlek</span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(SIZE_LABELS) as SizeFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSizeFilter(s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      sizeFilter === s
                        ? "bg-sky-600 text-white"
                        : "bg-white/10 text-slate-300 hover:bg-white/20"
                    }`}
                  >
                    {SIZE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand filter */}
            <div className="space-y-2">
              <span className="text-sm text-slate-300">Märke</span>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="block w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="all" className="bg-slate-800 text-white">Alla märken</option>
                {brands.filter((b) => b !== "all").map((b) => (
                  <option key={b} value={b} className="bg-slate-800 text-white">{b}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <span className="text-sm text-slate-300">Sortera efter</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="block w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="price" className="bg-slate-800 text-white">Lägst pris</option>
                <option value="range" className="bg-slate-800 text-white">Längst räckvidd</option>
                <option value="brand" className="bg-slate-800 text-white">Märke (A-Ö)</option>
              </select>
            </div>

            {/* Zero down payment toggle */}
            <div className="space-y-2">
              <span className="text-sm text-slate-300">Insats</span>
              <label className="flex cursor-pointer items-center gap-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={zeroDownOnly}
                  onClick={() => setZeroDownOnly(!zeroDownOnly)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                    zeroDownOnly ? "bg-sky-600" : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                      zeroDownOnly ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-300">Bara 0 kr insats</span>
              </label>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Visar {filtered.length} av {LEASING_OFFERS.length} erbjudanden
          </p>
          </div>
          )}
        </div>

        {/* Offers grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <OfferCard key={o.id} offer={o} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 text-center">
              <p className="text-slate-300">Inga erbjudanden matchar dina filter. Prova att höja maxpriset.</p>
            </div>
          )}
        </div>

        {/* Tips section */}
        <div className="mt-12 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-8">
          <h2 className="text-xl font-bold text-white">Tips vid privatleasing</h2>
          <div className="mt-4 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-200">Vad ingår?</h3>
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
              <h3 className="font-semibold text-slate-200">Tänk på</h3>
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
          <p className="mt-2 text-emerald-100">Vår kostnadskalkylator visar vad det faktiskt kostar att äga en elbil vs fossilbil.</p>
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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition hover:bg-white/15 hover:border-sky-400/50">
      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Badges row */}
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
            o.downPayment === 0
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 text-white"
          }`}>
            {o.downPayment === 0 ? "0 kr insats" : `${fmtSek(o.downPayment)} kr insats`}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 shadow-sm">
            {SIZE_LABELS[o.size]}
          </span>
        </div>

        {/* Brand & Model */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            {brandFlag(o.brand) && (
              <img src={`https://flagcdn.com/w40/${brandFlag(o.brand).toLowerCase()}.png`} alt="" className="h-4 w-auto rounded-sm" />
            )}
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">{o.brand}</p>
          </div>
          <h3 className="mt-0.5 text-lg font-bold leading-tight text-white">{o.model}</h3>
          <p className="text-sm text-slate-400">{o.trim}</p>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-1.5 rounded-xl bg-white/5 px-4 py-3">
          <span className="text-3xl font-extrabold text-white">{fmtSek(o.monthlyPrice)}</span>
          <span className="text-sm font-medium text-slate-400">kr/mån</span>
        </div>

        {/* Specs grid */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="h-4 w-4 shrink-0 text-sky-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
            {o.rangeKm} km
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="h-4 w-4 shrink-0 text-sky-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" /></svg>
            {o.batteryKwh} kWh
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="h-4 w-4 shrink-0 text-sky-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            {o.contractMonths} mån
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <svg className="h-4 w-4 shrink-0 text-sky-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
            {fmtSek(o.annualMileage)} mil/år
          </div>
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {includedBadge(o.serviceIncluded, "Service")}
          {includedBadge(o.winterTiresIncluded, "Vinterdäck")}
          {includedBadge(o.insuranceIncluded, "Försäkring")}
        </div>

        {o.note && (
          <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">{o.note}</p>
        )}

        {/* Source link */}
        <div className="mt-auto pt-4">
          <a
            href={o.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-500/10 px-4 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-sky-500/20"
          >
            Till {o.source}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
              <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
