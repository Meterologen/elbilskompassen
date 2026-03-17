"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, useCallback } from "react";
import {
  getDefaultFormData,
  calculateTCO,
  DEFAULTS,
  type VehicleClass,
  type CalculationResults,
} from "../lib/tco";
import { EV_MODELS, type EvModel } from "../lib/cars";
import { LEASING_OFFERS, type LeasingOffer } from "../lib/leasing";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function fmt(n: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtShort(n: number) {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(n);
}

const VCS: { v: VehicleClass; l: string }[] = [
  { v: "small", l: "Kompakt" },
  { v: "medium", l: "Mellanklass" },
  { v: "large", l: "SUV" },
];

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}

function Slider({ label, value, min, max, step, unit, onChange, formatValue }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : fmtShort(value);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="rounded-full bg-white/15 px-3 py-0.5 text-sm font-semibold text-sky-300">
          {display} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input w-full"
        style={{
          background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{fmtShort(min)} {unit}</span>
        <span>{fmtShort(max)} {unit}</span>
      </div>
    </div>
  );
}

function classDefaults(v: VehicleClass) {
  return DEFAULTS.vehicleClasses[v];
}

const LEASING_RATE = 0.039;
const LEASING_MONTHS = 36;

function leasingMonthly(price: number, residualShare: number) {
  const residual = price * residualShare;
  const depreciation = (price - residual) / LEASING_MONTHS;
  const interest = ((price + residual) / 2) * (LEASING_RATE / 12);
  return depreciation + interest;
}

const USED_CAR_DEFAULTS: Record<VehicleClass, {
  purchasePrice: number;
  residualShareAfter3y: number;
  insuranceAnnual: number;
  taxAnnual: number;
  maintenanceAnnual: number;
}> = {
  small: {
    purchasePrice: 130_000,
    residualShareAfter3y: 0.70,
    insuranceAnnual: 4_200,
    taxAnnual: 4_500,
    maintenanceAnnual: 8_000,
  },
  medium: {
    purchasePrice: 180_000,
    residualShareAfter3y: 0.67,
    insuranceAnnual: 5_200,
    taxAnnual: 5_500,
    maintenanceAnnual: 10_000,
  },
  large: {
    purchasePrice: 220_000,
    residualShareAfter3y: 0.65,
    insuranceAnnual: 6_500,
    taxAnnual: 6_500,
    maintenanceAnnual: 12_000,
  },
};

interface UsedCarMonthlyCosts {
  depreciation: number;
  capitalCost: number;
  fuel: number;
  insurance: number;
  tax: number;
  maintenance: number;
  maintenanceLow: number;
  maintenanceHigh: number;
  total: number;
  totalLow: number;
  totalHigh: number;
}

function interpolateResidualShare(price: number): number {
  // Billigare (äldre) bilar tappar procentuellt mindre, dyrare (nyare) tappar mer
  const points = [
    { price: 50_000, share: 0.80 },
    { price: 200_000, share: 0.67 },
    { price: 400_000, share: 0.52 },
    { price: 600_000, share: 0.45 },
  ];
  if (price <= points[0].price) return points[0].share;
  if (price >= points[points.length - 1].price) return points[points.length - 1].share;
  for (let i = 0; i < points.length - 1; i++) {
    if (price <= points[i + 1].price) {
      const t = (price - points[i].price) / (points[i + 1].price - points[i].price);
      return points[i].share + t * (points[i + 1].share - points[i].share);
    }
  }
  return points[points.length - 1].share;
}

function interpolateInsurance(price: number): number {
  // Skalas proportionellt med pris, clampat 3 000 – 10 000 kr/år
  const raw = 3_000 + ((price - 50_000) / (600_000 - 50_000)) * (10_000 - 3_000);
  return Math.round(Math.max(3_000, Math.min(10_000, raw)));
}

function calcUsedCarMonthly(vc: VehicleClass, fossilEnergyAnnual: number, customPrice?: number): UsedCarMonthlyCosts {
  const u = USED_CAR_DEFAULTS[vc];
  const price = customPrice ?? u.purchasePrice;
  const residualShare = interpolateResidualShare(price);
  const insuranceAnnual = interpolateInsurance(price);
  const residual = price * residualShare;
  const depreciationAnnual = (price - residual) / 3;
  const capitalCostAnnual = ((price + residual) / 2) * DEFAULTS.capitalCostRate;
  const fixedMonthly = Math.round(depreciationAnnual / 12) + Math.round(capitalCostAnnual / 12)
    + Math.round(fossilEnergyAnnual / 12) + Math.round(insuranceAnnual / 12) + Math.round(u.taxAnnual / 12);
  const maintenanceMonthly = Math.round(u.maintenanceAnnual / 12);
  // Best case: bara grundservice. Worst case: oturligt år med stor reparation.
  const maintenanceLow = Math.round(maintenanceMonthly * 0.3);
  const maintenanceHigh = Math.round(maintenanceMonthly * 2.5);
  return {
    depreciation: Math.round(depreciationAnnual / 12),
    capitalCost: Math.round(capitalCostAnnual / 12),
    fuel: Math.round(fossilEnergyAnnual / 12),
    insurance: Math.round(insuranceAnnual / 12),
    tax: Math.round(u.taxAnnual / 12),
    maintenance: maintenanceMonthly,
    maintenanceLow,
    maintenanceHigh,
    total: fixedMonthly + maintenanceMonthly,
    totalLow: fixedMonthly + maintenanceLow,
    totalHigh: fixedMonthly + maintenanceHigh,
  };
}

function defaultEvForClass(vc: VehicleClass): EvModel | null {
  if (vc === "small") {
    // Billigaste leasingbilen
    const cheapest = [...LEASING_OFFERS].sort((a, b) => a.monthlyPrice - b.monthlyPrice)[0];
    if (cheapest) {
      return EV_MODELS.find(m => m.brand.toLowerCase() === cheapest.brand.toLowerCase()) ?? null;
    }
    return null;
  }
  if (vc === "medium") {
    return EV_MODELS.find(m => m.id === "volvo-ex30") ?? null;
  }
  // large / SUV
  return EV_MODELS.find(m => m.id === "bmw-ix1") ?? EV_MODELS.find(m => m.brand === "BMW") ?? null;
}

function findBestLeasingOffer(selectedEv: EvModel | null, vc: VehicleClass): LeasingOffer | null {
  if (selectedEv) {
    const brandMatch = LEASING_OFFERS
      .filter(o => o.brand.toLowerCase() === selectedEv.brand.toLowerCase())
      .sort((a, b) => a.monthlyPrice - b.monthlyPrice)[0];
    if (brandMatch) return brandMatch;
  }
  const sizeMap: Record<string, string> = { small: "compact", medium: "compact", large: "suv" };
  const sizeMatch = LEASING_OFFERS
    .filter(o => o.size === (sizeMap[vc] || "compact") && o.brand === "Volvo")
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice)[0];
  if (sizeMatch) return sizeMatch;
  const anyMatch = LEASING_OFFERS
    .filter(o => o.size === (sizeMap[vc] || "compact"))
    .sort((a, b) => a.monthlyPrice - b.monthlyPrice)[0];
  return anyMatch || null;
}

function Inner() {
  const sp = useSearchParams();
  const urlEvPrice = sp.get("evPrice") || "";
  const urlEvModel = sp.get("evModel") || "";
  const pk = sp.get("evKwhPerMile") || "";

  const initVc: VehicleClass = "medium";
  const [miles, setMiles] = useState<number>(DEFAULTS.annualMiles);
  const [years, setYears] = useState<number>(DEFAULTS.ownershipYears);
  const [vc, setVc] = useState<VehicleClass>(initVc);

  const initEv = urlEvModel
    ? EV_MODELS.find(m => `${m.brand} ${m.model}` === urlEvModel) ?? null
    : defaultEvForClass(initVc);
  const [selectedEv, setSelectedEv] = useState<EvModel | null>(initEv);
  const [evPrice, setEvPrice] = useState<number>(
    urlEvPrice ? Number(urlEvPrice) : initEv ? initEv.priceSek : classDefaults(initVc).ev.purchasePrice
  );
  const [fossilPrice, setFossilPrice] = useState<number>(classDefaults(initVc).fossil.purchasePrice);
  const [homeCharge, setHomeCharge] = useState(true);
  const [homeShare, setHomeShare] = useState<number>(DEFAULTS.electricity.homeChargingSharePct);
  const [elPrice, setElPrice] = useState<number>(DEFAULTS.electricity.homeOrePerKwh / 100);
  const [gasPrice, setGasPrice] = useState<number>(DEFAULTS.fossilFuel.petrolSekPerLiter);
  const [fuel, setFuel] = useState<"petrol" | "diesel">("petrol");
  const [maintenanceOverride, setMaintenanceOverride] = useState<number | null>(null);
  const [usedCarPrice, setUsedCarPrice] = useState<number>(USED_CAR_DEFAULTS[initVc].purchasePrice);

  const handleVcChange = (newVc: VehicleClass) => {
    setVc(newVc);
    setMaintenanceOverride(null);
    setUsedCarPrice(USED_CAR_DEFAULTS[newVc].purchasePrice);
    const cd = classDefaults(newVc);
    setFossilPrice(cd.fossil.purchasePrice);
    const ev = defaultEvForClass(newVc);
    setSelectedEv(ev);
    setEvPrice(ev ? ev.priceSek : cd.ev.purchasePrice);
  };

  const evKwh = selectedEv ? String(selectedEv.kwhPerMile) : pk || "";
  const fossilLpm = "";

  const compute = useCallback(() => {
    const d = getDefaultFormData();
    return calculateTCO({
      ...d,
      annualKm: String(miles),
      vehicleClass: vc,
      ownershipYears: String(years),
      chargingAtHome: homeCharge,
      homeChargingShare: homeCharge ? String(homeShare) : "0",
      electricityPrice: String(elPrice * 100),
      fossilFuelType: fuel,
      fossilFuelPricePerLiter: String(gasPrice),
      evModel: selectedEv ? `${selectedEv.brand} ${selectedEv.model}` : urlEvModel,
      evPrice: String(evPrice),
      fossilPrice: String(fossilPrice),
      evKwhPerMileCity: evKwh,
      evKwhPerMileHighway: evKwh,
      fossilLitersPerMileCity: fossilLpm,
      fossilLitersPerMileHighway: fossilLpm,
    });
  }, [miles, vc, years, homeCharge, homeShare, elPrice, gasPrice, fuel, selectedEv, urlEvModel, evPrice, fossilPrice, evKwh, fossilLpm]);

  const r: CalculationResults = useMemo(compute, [compute]);

  // Leasing comparison values
  const offer = findBestLeasingOffer(selectedEv, vc);
  const usedBase = calcUsedCarMonthly(vc, r.fossil.energyAnnual, usedCarPrice);
  const effectiveMaintenance = maintenanceOverride ?? usedBase.maintenance;
  const usedTotal = usedBase.total - usedBase.maintenance + effectiveMaintenance;
  const used = { ...usedBase, maintenance: effectiveMaintenance, total: usedTotal };
  const evElMonthly = Math.round(r.ev.energyAnnual / 12);
  const evInsuranceMonthly = offer?.insuranceIncluded ? 0 : 800;
  const hasRealOffer = !!offer;
  const leasingPrice = hasRealOffer
    ? offer.monthlyPrice
    : Math.round(leasingMonthly(evPrice, r.ev.residualValue / evPrice));
  const evTotal = leasingPrice + evElMonthly + evInsuranceMonthly;
  const saving = used.total - evTotal;
  const savingAnnual = saving * 12;
  const pos = saving > 0;

  // Stacked bar data: monthly costs broken into categories
  const stackedBarData = [
    {
      name: `${fuel === "diesel" ? "Diesel" : "Bensin"}bil`,
      "Bil & finansiering": used.depreciation + used.capitalCost,
      "Energi (bränsle/el)": used.fuel,
      "Försäkring": used.insurance,
      "Skatt & service": used.tax + used.maintenance,
      total: used.total,
    },
    {
      name: "Elbil (leasing)",
      "Bil & finansiering": leasingPrice,
      "Energi (bränsle/el)": evElMonthly,
      "Försäkring": evInsuranceMonthly,
      "Skatt & service": 0,
      total: evTotal,
    },
  ];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startsida", item: "https://elbilskompassen.se" },
      { "@type": "ListItem", position: 2, name: "Elbilskalkyl", item: "https://elbilskompassen.se/kalkyl" },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-sky-300 hover:text-sky-200 hover:underline">Startsida</Link>
          <Link href="/kompassen" className="text-sky-300 hover:text-sky-200 hover:underline">Elbilskompassen</Link>
        </nav>

        {/* ── 1. Hero ─────────────────────────────────────────── */}
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Vad kostar din bil egentligen?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-200">
            De flesta underskattar sina bilkostnader. Med en leasad elbil vet du exakt vad du betalar varje månad — inga överraskningar.
          </p>
        </div>

        {/* ── Konsumentverkets drivmedelsjämförelse ─────────── */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-sky-300">Enligt Konsumentverket (Q1 2026)</p>
              <p className="mt-1 text-lg font-semibold text-white sm:text-xl">
                El kostar <span className="text-emerald-400">63 % mindre</span> per mil än bensin
              </p>
            </div>
            <a
              href="https://publikationer.konsumentverket.se/produkter-och-tjanster/bil-bat-och-motorcykel/jamforelse-av-drivmedelskostnader"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 self-start rounded-full border border-white/30 px-4 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              Källa &rarr;
            </a>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { label: "El", cost: 34.58, color: "bg-emerald-400" },
              { label: "Bensin", cost: 93.39, color: "bg-orange-400" },
              { label: "Diesel", cost: 105.03, color: "bg-red-400" },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="w-14 text-right text-sm font-medium text-slate-200">{d.label}</span>
                <div className="flex-1">
                  <div
                    className={`${d.color} h-7 rounded-md flex items-center transition-all duration-500`}
                    style={{ width: `${(d.cost / 110) * 100}%` }}
                  >
                    <span className="pl-3 text-xs font-bold text-white drop-shadow">
                      {d.cost.toFixed(0)} kr
                    </span>
                  </div>
                </div>
                <span className="w-20 text-right text-xs text-slate-400">/100 km</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Genomsnittlig drivmedelskostnad per 100 km baserat på de mest sålda bilmodellerna i Sverige. Uppdateras kvartalsvis.
          </p>
        </div>

        {urlEvModel && (
          <div className="mt-6 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
            Vi har fyllt i uppgifter för <strong className="text-white">{urlEvModel}</strong> åt dig.
          </div>
        )}

        {/* ── 2. Snabbval ─────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 sm:p-8">
          <div>
            <span className="text-base font-medium text-slate-200">Vilken typ av bil kör du?</span>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {VCS.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => handleVcChange(o.v)}
                  className={`rounded-xl border-2 px-4 py-4 text-center text-base font-semibold transition ${
                    vc === o.v
                      ? "border-sky-400 bg-white/15 text-white"
                      : "border-white/20 bg-white/5 text-slate-300 hover:border-white/40"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <Slider
              label="Körsträcka"
              value={miles}
              min={200}
              max={4000}
              step={50}
              unit="mil/år"
              onChange={setMiles}
            />
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-300">
            <span>Drivmedel:</span>
            <button
              type="button"
              onClick={() => { setFuel("petrol"); setGasPrice(DEFAULTS.fossilFuel.petrolSekPerLiter); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                fuel === "petrol" ? "bg-sky-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Bensin
            </button>
            <button
              type="button"
              onClick={() => { setFuel("diesel"); setGasPrice(DEFAULTS.fossilFuel.dieselSekPerLiter); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                fuel === "diesel" ? "bg-sky-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              Diesel
            </button>
          </div>
        </div>

        {/* ── 3. Resultat — savings som HERO-siffra + kort ────── */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 sm:p-8">
          {/* Hero savings number */}
          {saving > 0 ? (
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">Enligt våra beräkningar kan du spara</p>
              <p className="mt-1 text-5xl font-extrabold text-emerald-400 sm:text-6xl">
                {fmtShort(Math.round(saving))} kr/mån
              </p>
              <p className="mt-2 text-slate-300">
                = {fmtShort(Math.round(savingAnnual))} kr/år — och köra en helt ny bil
              </p>
            </div>
          ) : saving > -300 ? (
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-sky-400">Ungefär samma kostnad</p>
              <p className="mt-1 text-4xl font-extrabold text-sky-400 sm:text-5xl">
                ±{fmtShort(Math.round(Math.abs(saving)))} kr/mån
              </p>
              <p className="mt-2 text-slate-300">
                Rent ekonomiskt går det ungefär jämnt ut. Du får däremot en ny bil med garanti, lägre miljöpåverkan och tystare körning.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-amber-400">Elbilen blir dyrare i din situation</p>
              <p className="mt-1 text-4xl font-extrabold text-amber-400 sm:text-5xl">
                +{fmtShort(Math.round(Math.abs(saving)))} kr/mån
              </p>
              <p className="mt-2 text-slate-300">
                Ekonomiskt är din nuvarande bil ett bra val. En elbil ger lägre miljöpåverkan och tystare körning, men det kostar mer.
              </p>
            </div>
          )}

          <p className="mt-4 text-center text-sm text-slate-400">
            Du lägger redan uppskattningsvis <strong className="text-white">{fmtShort(used.total)} kr/mån</strong> på din {fuel === "diesel" ? "diesel" : "bensin"}bil — men beroende på reparationer kan det variera mellan {fmtShort(used.totalLow)} och {fmtShort(used.totalHigh)} kr/mån.
          </p>

          {/* Side-by-side cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Left card: Din nuvarande bil */}
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-red-400">
                Din {fuel === "diesel" ? "diesel" : "bensin"}bil idag
              </p>
              <div className="mt-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-red-300">Vad är din bil värd idag?</span>
                    <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-300">
                      {fmtShort(usedCarPrice)} kr
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50_000}
                    max={600_000}
                    step={10_000}
                    value={usedCarPrice}
                    onChange={(e) => setUsedCarPrice(Number(e.target.value))}
                    className="w-full cursor-pointer appearance-none rounded-full h-2 bg-gradient-to-r from-red-900/40 to-red-500/40 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-red-400 [&::-webkit-slider-thumb]:shadow"
                  />
                  <div className="flex justify-between text-[10px] text-red-400/60">
                    <span>50 000 kr</span>
                    <span>600 000 kr</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-red-200">
                <div className="flex justify-between">
                  <span>Värdeminskning</span>
                  <span className="font-medium">{fmtShort(used.depreciation)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Kapitalkostnad</span>
                  <span className="font-medium">{fmtShort(used.capitalCost)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Bränsle</span>
                  <span className="font-medium">{fmtShort(used.fuel)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Försäkring</span>
                  <span className="font-medium">{fmtShort(used.insurance)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Fordonsskatt</span>
                  <span className="font-medium">{fmtShort(used.tax)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Service &amp; reparation</span>
                  <span className="font-medium">{fmtShort(used.maintenance)} kr</span>
                </div>
                <div className="flex justify-between border-t border-red-500/30 pt-2">
                  <span className="font-semibold text-white">Totalt</span>
                  <span className="text-xl font-bold text-red-400">{fmtShort(used.total)} kr/mån</span>
                </div>
              </div>
              {/* Osäkerhetsspann — interaktiv */}
              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-red-300">Dra för att simulera tur/otur med reparationer</p>
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-300">{fmtShort(used.maintenance)} kr/mån</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-red-400/80 whitespace-nowrap">Tur</span>
                  <div className="relative flex-1">
                    <div className="absolute inset-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-500/40 via-red-500/50 to-red-600/60" />
                    <input
                      type="range"
                      min={usedBase.maintenanceLow}
                      max={usedBase.maintenanceHigh}
                      step={50}
                      value={used.maintenance}
                      onChange={(e) => setMaintenanceOverride(Number(e.target.value))}
                      className="relative z-10 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-red-400 [&::-webkit-slider-thumb]:shadow"
                    />
                  </div>
                  <span className="text-[11px] text-red-400/80 whitespace-nowrap">Otur</span>
                </div>
                <p className="mt-1.5 text-[11px] text-red-400/70">
                  En bra månad kostar bara grundservice ({fmtShort(usedBase.maintenanceLow)} kr). Ett oturligt år kan innebära kamrem, koppling eller AC-kompressor — upp till {fmtShort(usedBase.maintenanceHigh)} kr/mån.
                </p>
              </div>
            </div>

            {/* Right card: Ny elbil via leasing */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                Ny elbil via leasing
                {hasRealOffer ? ` – ${offer.brand} ${offer.model}` : selectedEv ? ` – ${selectedEv.brand} ${selectedEv.model}` : ""}
              </p>
              <div className="mt-3 space-y-1.5 text-sm text-emerald-200">
                <div className="flex justify-between">
                  <span>Privatleasing{hasRealOffer && offer.serviceIncluded ? " (inkl. service)" : ""}</span>
                  <span className="font-medium">{fmtShort(leasingPrice)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>El</span>
                  <span className="font-medium">{fmtShort(evElMonthly)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span>Försäkring{offer?.insuranceIncluded ? " (ingår)" : ""}</span>
                  <span className="font-medium">{offer?.insuranceIncluded ? "0" : fmtShort(evInsuranceMonthly)} kr</span>
                </div>
                <div className="flex justify-between border-t border-emerald-500/30 pt-2">
                  <span className="font-semibold text-white">Totalt</span>
                  <span className="text-xl font-bold text-emerald-400">{fmtShort(evTotal)} kr/mån</span>
                </div>
              </div>
              {hasRealOffer && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    {offer.trim}
                  </span>
                  {offer.downPayment > 0 && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                      Insats {fmtShort(offer.downPayment)} kr
                    </span>
                  )}
                </div>
              )}
              {hasRealOffer && (
                <p className="mt-2 text-xs text-emerald-400/70">
                  Källa:{" "}
                  <a
                    href={offer.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-emerald-300"
                  >
                    {offer.source}
                  </a>
                </p>
              )}
              {/* Förutsägbarhet */}
              <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                <p className="text-xs font-semibold text-emerald-300">Fast kostnad — inga överraskningar</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-emerald-500/40" />
                </div>
                <p className="mt-1.5 text-[11px] text-emerald-400/70">
                  Med leasing vet du exakt vad du betalar varje månad. Service ingår ofta, och garantin täcker reparationer.
                </p>
              </div>
            </div>
          </div>

          {/* ── 4. Trygghetsargument / ärlig bedömning ─────────── */}
          {saving > 0 ? (
            <div className="mt-6 rounded-xl bg-white/5 border border-white/10 px-5 py-4">
              <ul className="space-y-2 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">&#10003;</span>
                  <span><strong className="text-white">Fast månadskostnad</strong> — inga överraskande verkstadsräkningar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">&#10003;</span>
                  <span><strong className="text-white">Ny bil med garanti</strong> — du slipper oroa dig för att den inte startar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">&#10003;</span>
                  <span><strong className="text-white">Service och underhåll</strong> ingår ofta i leasingen</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-amber-500/10 border border-amber-500/20 px-5 py-4">
              <p className="text-sm font-semibold text-amber-300">Ärligt talat</p>
              <p className="mt-1 text-sm text-amber-200/80">
                Med dina förutsättningar är din nuvarande bil billigare att köra. Ett elbilsbyte handlar i ditt fall mer om andra värden:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-amber-200/80">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-amber-400">•</span>
                  <span><strong className="text-amber-200">Lägre klimatpåverkan</strong> — en elbil släpper ut ca 70 % mindre CO₂ över sin livstid</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-amber-400">•</span>
                  <span><strong className="text-amber-200">Tystare och skönare körning</strong> — ingen motor som vibrerar och bullrar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-amber-400">•</span>
                  <span><strong className="text-amber-200">Förutsägbar kostnad</strong> — leasing ger fast månadskostnad utan överraskningar</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-amber-400/70">
                Tips: Testa att justera körsträcka eller bilklass — det kan förändra kalkylen.
              </p>
            </div>
          )}

          {/* ── 5. CTA ────────────────────────────────────────── */}
          <div className="mt-6 text-center">
            <Link
              href="/leasing"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white shadow hover:bg-emerald-400 transition"
            >
              Se leasingerbjudanden &rarr;
            </Link>
          </div>
        </div>

        {/* ── 6. Förenklat stapeldiagram ──────────────────────── */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 sm:p-8">
          <h2 className="text-center text-base font-semibold text-white">
            Månadskostnad — uppdelad
          </h2>
          <p className="mt-1 text-center text-sm text-slate-400">
            Staplarna visar att totalbeloppet ofta hamnar nära varandra, men elbilen har en enklare uppdelning.
          </p>
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={stackedBarData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                barCategoryGap="25%"
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  domain={[0, "auto"]}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13, fontWeight: 500, fill: "#e2e8f0" }}
                  width={130}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => `${fmtShort(Number(v))} kr/mån`}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    color: "#e2e8f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    fontSize: "13px",
                    padding: "8px 14px",
                  }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12, color: "#94a3b8" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Bil & finansiering" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Energi (bränsle/el)" stackId="a" fill="#38bdf8" />
                <Bar dataKey="Försäkring" stackId="a" fill="#a78bfa" />
                <Bar dataKey="Skatt & service" stackId="a" fill="#64748b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex justify-center gap-8 text-sm">
            <span className="text-slate-400">{fuel === "diesel" ? "Diesel" : "Bensin"}bil: <strong className="text-white">{fmtShort(used.total)} kr/mån</strong></span>
            <span className="text-slate-400">Elbil: <strong className="text-emerald-400">{fmtShort(evTotal)} kr/mån</strong></span>
          </div>
        </div>

        {/* ── 7. Trovärdighet + Metodik (expanderbart) ────────── */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between p-6 sm:p-8">
              <div>
                <h2 className="text-base font-semibold text-white">Kan det verkligen stämma?</h2>
                <p className="mt-1 text-sm text-slate-400">Läs om källorna bakom siffrorna och hur vi räknat.</p>
              </div>
              <span className="text-2xl text-slate-400 transition-transform duration-200 group-open:rotate-180">
                &#9660;
              </span>
            </summary>
            <div className="border-t border-white/10 p-6 sm:p-8 space-y-6">
              {/* Sifo/KVD info box */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4">
                <p className="text-sm font-semibold text-amber-300">
                  Visste du? Svenskar underskattar sina bilkostnader med upp till 3 000 kr/mån
                </p>
                <p className="mt-1 text-xs text-amber-200/80">
                  Enligt en Sifo-undersökning (1 775 svarande) beställd av KVD Bilpriser tror de flesta att bilen kostar
                  betydligt mindre än den faktiskt gör. Den största blinda fläcken är värdeminskning, följt av service och
                  reparationer — som ökar markant efter garantitidens slut. M Sveriges bilkostnadskalkylator{" "}
                  <em>exkluderar</em> dessutom oväntade reparationer helt.
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-400/70">
                  <a href="https://www.vibilagare.se/nyheter/manga-tror-att-bilen-kostar-mindre-den-gor" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">Vi Bilägare / Sifo</a>
                  <a href="https://www.kvd.se/artiklar/kopguider/billigaste-bilarna-att-aga-2025" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">KVD – Billigaste bilarna att äga 2025</a>
                  <a href="https://msverige.se/allt-om-bilen/vad-kostar-det-att-ha-bil/sa-har-vi-raknat/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">M Sverige – Så har vi räknat</a>
                </div>
              </div>

              {/* How we calculated (used car) */}
              <div className="text-xs text-slate-300 space-y-2">
                <h3 className="text-sm font-semibold text-white">Så har vi räknat — din nuvarande bil</h3>
                <p>
                  Du anger själv din bils ungefärliga värde ({fmtShort(usedCarPrice)} kr).
                  Vi antar att bilen behålls i 3 år och att den tappar i värde beroende på nuvarande pris — en billigare (äldre) bil tappar procentuellt mindre, en dyrare (nyare) bil tappar mer.
                </p>
                <ul className="list-inside list-disc space-y-0.5">
                  <li><strong className="text-white">Värdeminskning:</strong> ca {Math.round((1 - interpolateResidualShare(usedCarPrice)) * 100)}% på 3 år, baserat på bilens värde.</li>
                  <li><strong className="text-white">Kapitalkostnad:</strong> {(DEFAULTS.capitalCostRate * 100).toFixed(1)}% ränta på genomsnittligt bundet kapital.</li>
                  <li><strong className="text-white">Försäkring:</strong> {fmtShort(interpolateInsurance(usedCarPrice))} kr/år, skalas med bilens värde.</li>
                  <li><strong className="text-white">Service &amp; reparation:</strong> {fmtShort(USED_CAR_DEFAULTS[vc].maintenanceAnnual)} kr/år inkl. service, däck och oväntade reparationer (som M Sveriges kalkyl exkluderar).</li>
                  <li><strong className="text-white">Bränsle:</strong> baserat på din körsträcka ({fmtShort(miles)} mil/år) och valt bränslepris.</li>
                </ul>
                <p>
                  {!hasRealOffer && <>Leasingkostnaden för elbilen är uppskattad utifrån bilens pris, restvärde och {(LEASING_RATE * 100).toFixed(1)} % ränta ({LEASING_MONTHS} mån). </>}
                  Källor: KVD (mars 2025), M Sverige, Vi Bilägare / Sifo.
                </p>
                <p>
                  Se även <a href="https://publikationer.konsumentverket.se/produkter-och-tjanster/bil-bat-och-motorcykel/jamforelse-av-drivmedelskostnader" target="_blank" rel="noopener noreferrer" className="font-medium text-sky-400 underline hover:text-sky-300">Konsumentverkets officiella jämförelse av drivmedelskostnader</a> (uppdateras kvartalsvis).
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* ── 8. Avslutande CTA ───────────────────────────────── */}
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white">
            {pos ? "Redo för nästa steg?" : "Utforska fler alternativ"}
          </h2>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/kompassen"
              className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50"
            >
              Starta Elbilskompassen
            </Link>
            <Link
              href="/modeller"
              className="rounded-full border-2 border-white/80 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Se alla modeller
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function KalkylPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-slate-300">Laddar kalkyl...</p>
        </main>
      }
    >
      <Inner />
    </Suspense>
  );
}
