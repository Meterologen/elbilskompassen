"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { EV_MODELS, formatSek, brandFlag, type CarSize } from "../lib/cars";

// ── Sort ────────────────────────────────────────────────────────────────────────
type SortKey = "price" | "range" | "trunk";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price", label: "Pris" },
  { value: "range", label: "Räckvidd" },
  { value: "trunk", label: "Bagage" },
];

// ── Filter chips ────────────────────────────────────────────────────────────────
const SIZE_LABELS: { value: CarSize | "all"; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "compact", label: "Kompakt" },
  { value: "medium", label: "Mellanklass" },
  { value: "suv", label: "SUV" },
  { value: "premium", label: "Premium" },
];

const ALL_BRANDS = [...new Set(EV_MODELS.map((c) => c.brand))].sort();

const chip = (active: boolean) =>
  `rounded-full px-4 py-1.5 text-sm font-medium transition ${
    active
      ? "bg-emerald-500 text-white shadow-md"
      : "border border-sky-300/50 bg-white/10 text-slate-200 hover:bg-white/20"
  }`;

const toggle = (active: boolean) =>
  `rounded-full px-4 py-1.5 text-sm font-medium transition ${
    active
      ? "bg-sky-500 text-white shadow-md"
      : "border border-sky-300/50 bg-white/10 text-slate-200 hover:bg-white/20"
  }`;

export default function ModellerPage() {
  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("price");

  // Filters (multi-select)
  const [sizeFilter, setSizeFilter] = useState<Set<CarSize>>(new Set());
  const [brandFilter, setBrandFilter] = useState<Set<string>>(new Set());
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [minRange, setMinRange] = useState<number>(0);
  const [minSeats, setMinSeats] = useState<number>(0);
  const [towbarOnly, setTowbarOnly] = useState(false);
  const [awdOnly, setAwdOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const priceMax = useMemo(() => Math.max(...EV_MODELS.map((c) => c.priceSek)), []);
  const rangeMax = useMemo(() => Math.max(...EV_MODELS.map((c) => c.rangeKm)), []);

  const filtered = useMemo(() => {
    let list = EV_MODELS.filter((c) => {
      if (sizeFilter.size > 0 && !sizeFilter.has(c.size)) return false;
      if (brandFilter.size > 0 && !brandFilter.has(c.brand)) return false;
      if (c.priceSek > maxPrice) return false;
      if (c.rangeKm < minRange) return false;
      if (minSeats > 0 && c.seats < minSeats) return false;
      if (towbarOnly && !c.towbar) return false;
      if (awdOnly && !c.awd) return false;
      return true;
    });

    list.sort((a, b) => {
      if (sortKey === "price") return a.priceSek - b.priceSek;
      if (sortKey === "range") return b.rangeKm - a.rangeKm;
      return b.trunkLiters - a.trunkLiters;
    });

    return list;
  }, [sizeFilter, brandFilter, maxPrice, minRange, minSeats, towbarOnly, awdOnly, sortKey]);

  const activeFilterCount = [
    sizeFilter.size > 0,
    brandFilter.size > 0,
    maxPrice < Infinity,
    minRange > 0,
    minSeats > 0,
    towbarOnly,
    awdOnly,
  ].filter(Boolean).length;

  const toggleSize = (v: CarSize) => {
    setSizeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  };

  const toggleBrand = (b: string) => {
    setBrandFilter((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b); else next.add(b);
      return next;
    });
  };

  const resetFilters = () => {
    setSizeFilter(new Set());
    setBrandFilter(new Set());
    setMaxPrice(Infinity);
    setMinRange(0);
    setMinSeats(0);
    setTowbarOnly(false);
    setAwdOnly(false);
  };

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">← Startsida</Link>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Elbilar i Sverige</h1>
        <p className="mt-2 text-lg text-slate-200">Utforska {EV_MODELS.length} populära elbilar.</p>

        {/* Sort */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-300">Sortera:</span>
          {SORT_OPTIONS.map((s) => (
            <button key={s.value} type="button" onClick={() => setSortKey(s.value)} className={chip(sortKey === s.value)}>
              {s.label} {sortKey === s.value && (sortKey === "price" ? "↑" : "↓")}
            </button>
          ))}
        </div>

        {/* Filter toggle */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-full border border-sky-300/50 bg-white/10 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-white/20 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
            Filtrera
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">{activeFilterCount}</span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button type="button" onClick={resetFilters} className="text-sm text-sky-300 hover:text-sky-200 hover:underline">
              Rensa filter
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 rounded-2xl border border-sky-300/30 bg-white/5 p-5 space-y-5">
            {/* Storlek */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Storlek</p>
              <div className="flex flex-wrap gap-2">
                {SIZE_LABELS.filter((s) => s.value !== "all").map((s) => (
                  <button key={s.value} type="button" onClick={() => toggleSize(s.value as CarSize)} className={chip(sizeFilter.has(s.value as CarSize))}>{s.label}</button>
                ))}
              </div>
            </div>

            {/* Märke */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Märke</p>
              <div className="flex flex-wrap gap-2">
                {ALL_BRANDS.map((b) => (
                  <button key={b} type="button" onClick={() => toggleBrand(b)} className={chip(brandFilter.has(b))}>{b}</button>
                ))}
              </div>
            </div>

            {/* Pris */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">
                Max pris: {maxPrice >= priceMax ? "Alla" : formatSek(maxPrice)}
              </p>
              <input
                type="range"
                min={200_000}
                max={priceMax}
                step={50_000}
                value={maxPrice >= priceMax ? priceMax : maxPrice}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMaxPrice(v >= priceMax ? Infinity : v);
                }}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatSek(200_000)}</span>
                <span>{formatSek(priceMax)}</span>
              </div>
            </div>

            {/* Räckvidd */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">
                Min räckvidd: {minRange === 0 ? "Alla" : `${minRange} km`}
              </p>
              <input
                type="range"
                min={0}
                max={rangeMax}
                step={50}
                value={minRange}
                onChange={(e) => setMinRange(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0 km</span>
                <span>{rangeMax} km</span>
              </div>
            </div>

            {/* Platser */}
            <div>
              <p className="mb-2 text-sm font-medium text-slate-300">Platser</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setMinSeats(0)} className={chip(minSeats === 0)}>Alla</button>
                <button type="button" onClick={() => setMinSeats(5)} className={chip(minSeats === 5)}>5+</button>
                <button type="button" onClick={() => setMinSeats(7)} className={chip(minSeats === 7)}>7+</button>
              </div>
            </div>

            {/* Dragkrok & AWD */}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setTowbarOnly(!towbarOnly)} className={toggle(towbarOnly)}>
                Dragkrok
              </button>
              <button type="button" onClick={() => setAwdOnly(!awdOnly)} className={toggle(awdOnly)}>
                Fyrhjulsdrift
              </button>
            </div>
          </div>
        )}

        {/* Result count */}
        <p className="mt-4 text-sm text-slate-400">Visar {filtered.length} av {EV_MODELS.length} modeller</p>

        {/* Grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((car) => (
            <div key={car.id} id={car.id} className="flex flex-col rounded-2xl border border-sky-300/40 bg-white/10 backdrop-blur-sm">
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{car.brand}</p>
                    <h2 className="text-lg font-bold text-white">{car.brand} {car.model}</h2>
                  </div>
                  {brandFlag(car.brand) && (
                    <img src={`https://flagcdn.com/w80/${brandFlag(car.brand).toLowerCase()}.png`} alt={brandFlag(car.brand)} className="h-8 w-auto rounded-sm shadow-sm" />
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-300">{car.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center"><p className="text-[11px] text-slate-400">Pris</p><p className="font-semibold text-slate-200">{formatSek(car.priceSek)}</p></div>
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center"><p className="text-[11px] text-slate-400">Räckvidd</p><p className="font-semibold text-slate-200">{car.rangeKm} km</p></div>
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center"><p className="text-[11px] text-slate-400">Batteri</p><p className="font-semibold text-slate-200">{car.batteryKwh} kWh</p></div>
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center"><p className="text-[11px] text-slate-400">Snabbladdning</p><p className="font-semibold text-slate-200">{car.fastChargeMin} min</p></div>
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center"><p className="text-[11px] text-slate-400">Bagage</p><p className="font-semibold text-slate-200">{car.trunkLiters} L</p></div>
                  <div className="rounded-lg bg-white/5 px-3 py-2 text-center"><p className="text-[11px] text-slate-400">Platser</p><p className="font-semibold text-slate-200">{car.seats} st</p></div>
                </div>
                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {car.towbar && <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/30">Dragkrok</span>}
                  {car.awd && <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-medium text-sky-300 ring-1 ring-sky-500/30">4WD</span>}
                </div>
              </div>
              <div className="border-t border-white/10 px-6 py-4">
                <Link href={`/kalkyl?evPrice=${car.priceSek}&evModel=${encodeURIComponent(car.brand + " " + car.model)}&evKwhPerMile=${car.kwhPerMile}`} className="block rounded-full bg-sky-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-sky-500">Räkna på {car.model}</Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-lg text-slate-300">Inga bilar matchar dina filter.</p>
            <button type="button" onClick={resetFilters} className="mt-3 text-sm text-sky-300 hover:text-sky-200 hover:underline">Rensa alla filter</button>
          </div>
        )}

        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Osäker på vilken som passar dig?</h2>
          <p className="mt-2 text-emerald-100">Svara på 10 frågor så matchar vi dig med rätt elbil.</p>
          <Link href="/kompassen" className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">Starta Elbilskompassen</Link>
        </div>
      </div>
    </main>
  );
}
