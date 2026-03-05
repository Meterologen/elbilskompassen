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
  type VehicleTcoResult,
} from "../lib/tco";
import { EV_MODELS, FOSSIL_MODELS, type EvModel, type FossilModel } from "../lib/cars";
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

const VCS: { v: VehicleClass; l: string; icon: string }[] = [
  { v: "small", l: "Kompakt", icon: "🚗" },
  { v: "medium", l: "Mellanklass", icon: "🚙" },
  { v: "large", l: "SUV", icon: "🚐" },
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
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="rounded-full bg-sky-100 px-3 py-0.5 text-sm font-semibold text-sky-800">
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
          background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{fmtShort(min)} {unit}</span>
        <span>{fmtShort(max)} {unit}</span>
      </div>
    </div>
  );
}

function costBreakdown(v: VehicleTcoResult) {
  return [
    { name: "Värdeminskning", value: v.depreciationAnnual },
    { name: "Kapitalkostnad", value: v.capitalCostAnnual },
    { name: "Försäkring", value: v.insuranceAnnual },
    { name: "Skatt", value: v.taxAnnual },
    { name: "Underhåll", value: v.maintenanceFundAnnual },
    { name: "Bränsle/El", value: v.energyAnnual },
  ];
}

function classDefaults(v: VehicleClass) {
  return DEFAULTS.vehicleClasses[v];
}

function sizeToVc(size: string): VehicleClass {
  if (size === "compact") return "small";
  if (size === "medium") return "medium";
  return "large";
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
  taxAndMaintenance: number;
  total: number;
}

function calcUsedCarMonthly(vc: VehicleClass, fossilEnergyAnnual: number): UsedCarMonthlyCosts {
  const u = USED_CAR_DEFAULTS[vc];
  const residual = u.purchasePrice * u.residualShareAfter3y;
  const depreciationAnnual = (u.purchasePrice - residual) / 3;
  const capitalCostAnnual = ((u.purchasePrice + residual) / 2) * DEFAULTS.capitalCostRate;
  return {
    depreciation: Math.round(depreciationAnnual / 12),
    capitalCost: Math.round(capitalCostAnnual / 12),
    fuel: Math.round(fossilEnergyAnnual / 12),
    insurance: Math.round(u.insuranceAnnual / 12),
    taxAndMaintenance: Math.round((u.taxAnnual + u.maintenanceAnnual) / 12),
    total: Math.round((depreciationAnnual + capitalCostAnnual + fossilEnergyAnnual + u.insuranceAnnual + u.taxAnnual + u.maintenanceAnnual) / 12),
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
  const [selectedFossil, setSelectedFossil] = useState<FossilModel | null>(null);

  const [evPrice, setEvPrice] = useState<number>(
    urlEvPrice ? Number(urlEvPrice) : initEv ? initEv.priceSek : classDefaults(initVc).ev.purchasePrice
  );
  const [fossilPrice, setFossilPrice] = useState<number>(classDefaults(initVc).fossil.purchasePrice);
  const [homeCharge, setHomeCharge] = useState(true);
  const [homeShare, setHomeShare] = useState<number>(DEFAULTS.electricity.homeChargingSharePct);
  const [elPrice, setElPrice] = useState<number>(DEFAULTS.electricity.homeOrePerKwh / 100);
  const [gasPrice, setGasPrice] = useState<number>(DEFAULTS.fossilFuel.petrolSekPerLiter);
  const [fuel, setFuel] = useState<"petrol" | "diesel">("petrol");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleVcChange = (newVc: VehicleClass) => {
    setVc(newVc);
    setSelectedFossil(null);
    const cd = classDefaults(newVc);
    setFossilPrice(cd.fossil.purchasePrice);
    const ev = defaultEvForClass(newVc);
    setSelectedEv(ev);
    setEvPrice(ev ? ev.priceSek : cd.ev.purchasePrice);
  };

  const handleEvSelect = (id: string) => {
    if (!id) { setSelectedEv(null); setEvPrice(classDefaults(vc).ev.purchasePrice); return; }
    const m = EV_MODELS.find(x => x.id === id);
    if (m) { setSelectedEv(m); setEvPrice(m.priceSek); setVc(sizeToVc(m.size)); }
  };

  const handleFossilSelect = (id: string) => {
    if (!id) { setSelectedFossil(null); setFossilPrice(classDefaults(vc).fossil.purchasePrice); return; }
    const m = FOSSIL_MODELS.find(x => x.id === id);
    if (m) { setSelectedFossil(m); setFossilPrice(m.priceSek); setFuel(m.fuelType); setGasPrice(m.fuelType === "diesel" ? DEFAULTS.fossilFuel.dieselSekPerLiter : DEFAULTS.fossilFuel.petrolSekPerLiter); }
  };

  const evKwh = selectedEv ? String(selectedEv.kwhPerMile) : pk || "";
  const fossilLpm = selectedFossil ? String(selectedFossil.litersPerMile) : "";

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
      ...(selectedFossil ? { fossilAnnualInsurance: String(selectedFossil.insuranceAnnual), fossilAnnualTax: String(selectedFossil.taxAnnual) } : {}),
    });
  }, [miles, vc, years, homeCharge, homeShare, elPrice, gasPrice, fuel, selectedEv, urlEvModel, evPrice, fossilPrice, evKwh, fossilLpm, selectedFossil]);

  const r: CalculationResults = useMemo(compute, [compute]);
  const pos = r.savings.annual > 0;

  // Leasing comparison values
  const offer = findBestLeasingOffer(selectedEv, vc);
  const used = calcUsedCarMonthly(vc, r.fossil.energyAnnual);
  const evElMonthly = Math.round(r.ev.energyAnnual / 12);
  const evInsuranceMonthly = offer?.insuranceIncluded ? 0 : 800;
  const hasRealOffer = !!offer;
  const leasingPrice = hasRealOffer
    ? offer.monthlyPrice
    : Math.round(leasingMonthly(evPrice, r.ev.residualValue / evPrice));
  const evTotal = leasingPrice + evElMonthly + evInsuranceMonthly;
  const saving = used.total - evTotal;
  const savingAnnual = saving * 12;

  // Stacked bar data: monthly costs broken into categories
  const stackedBarData = [
    {
      name: `${fuel === "diesel" ? "Diesel" : "Bensin"}bil`,
      "Värdeminskning": used.depreciation + used.capitalCost,
      "Bränsle/El": used.fuel,
      "Försäkring": used.insurance,
      "Skatt & service": used.taxAndMaintenance,
      total: used.total,
    },
    {
      name: "Elbil (leasing)",
      "Värdeminskning": leasingPrice,
      "Bränsle/El": evElMonthly,
      "Försäkring": evInsuranceMonthly,
      "Skatt & service": 0,
      total: evTotal,
    },
  ];

  return (
    <main id="main-content" className="min-h-screen" role="main">
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

        {urlEvModel && (
          <div className="mt-6 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
            Vi har fyllt i uppgifter för <strong className="text-white">{urlEvModel}</strong> åt dig.
          </div>
        )}

        {/* ── 2. Snabbval ─────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <span className="text-sm font-medium text-slate-700">Vilken typ av bil kör du?</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {VCS.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => handleVcChange(o.v)}
                  className={`rounded-xl border-2 px-3 py-3 text-center text-sm font-medium transition ${
                    vc === o.v
                      ? "border-sky-500 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xl">{o.icon}</span>
                  <span className="mt-1 block">{o.l}</span>
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

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-700">
            <span>Drivmedel:</span>
            <button
              type="button"
              onClick={() => { setFuel("petrol"); setGasPrice(DEFAULTS.fossilFuel.petrolSekPerLiter); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                fuel === "petrol" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Bensin
            </button>
            <button
              type="button"
              onClick={() => { setFuel("diesel"); setGasPrice(DEFAULTS.fossilFuel.dieselSekPerLiter); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                fuel === "diesel" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Diesel
            </button>
          </div>
        </div>

        {/* ── 3. Resultat — savings som HERO-siffra + kort ────── */}
        <div className="mt-8 rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm sm:p-8">
          {/* Hero savings number */}
          {saving > 0 ? (
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-600">Du kan spara</p>
              <p className="mt-1 text-5xl font-extrabold text-emerald-600 sm:text-6xl">
                {fmtShort(Math.round(saving))} kr/mån
              </p>
              <p className="mt-2 text-slate-500">
                = {fmtShort(Math.round(savingAnnual))} kr/år — och köra en helt ny bil
              </p>
            </div>
          ) : saving > -300 ? (
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-sky-600">Ungefär samma kostnad</p>
              <p className="mt-1 text-4xl font-extrabold text-sky-600 sm:text-5xl">
                ±{fmtShort(Math.round(Math.abs(saving)))} kr/mån
              </p>
              <p className="mt-2 text-slate-500">
                Ingen stor skillnad i plånboken — men du kör en ny bil med lägre risk
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-amber-600">Leasingen kostar mer</p>
              <p className="mt-1 text-4xl font-extrabold text-amber-600 sm:text-5xl">
                +{fmtShort(Math.round(Math.abs(saving)))} kr/mån
              </p>
              <p className="mt-2 text-slate-500">
                Men du kör en helt ny bil utan risk för dyra reparationer
              </p>
            </div>
          )}

          <p className="mt-4 text-center text-sm text-slate-500">
            Du lägger redan uppskattningsvis <strong className="text-slate-700">{fmtShort(used.total)} kr/mån</strong> på din {fuel === "diesel" ? "diesel" : "bensin"}bil (5 år gammal, {fmtShort(miles)} mil/år).
          </p>

          {/* Side-by-side cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Left card: Din nuvarande bil */}
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-red-700">
                Din {fuel === "diesel" ? "diesel" : "bensin"}bil idag
              </p>
              <div className="mt-3 space-y-1.5 text-sm text-red-800">
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
                  <span>Skatt + service &amp; reparation</span>
                  <span className="font-medium">{fmtShort(used.taxAndMaintenance)} kr</span>
                </div>
                <div className="flex justify-between border-t border-red-200 pt-2">
                  <span className="font-semibold">Totalt</span>
                  <span className="text-xl font-bold text-red-700">{fmtShort(used.total)} kr/mån</span>
                </div>
              </div>
            </div>

            {/* Right card: Ny elbil via leasing */}
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                Ny elbil via leasing
                {hasRealOffer ? ` – ${offer.brand} ${offer.model}` : selectedEv ? ` – ${selectedEv.brand} ${selectedEv.model}` : ""}
              </p>
              <div className="mt-3 space-y-1.5 text-sm text-emerald-800">
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
                <div className="flex justify-between border-t border-emerald-200 pt-2">
                  <span className="font-semibold">Totalt</span>
                  <span className="text-xl font-bold text-emerald-700">{fmtShort(evTotal)} kr/mån</span>
                </div>
              </div>
              {hasRealOffer && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                    {offer.trim}
                  </span>
                  {offer.downPayment > 0 && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      Insats {fmtShort(offer.downPayment)} kr
                    </span>
                  )}
                </div>
              )}
              {hasRealOffer && (
                <p className="mt-2 text-xs text-emerald-700">
                  Källa:{" "}
                  <a
                    href={offer.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-emerald-900"
                  >
                    {offer.source}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* ── 4. Trygghetsargument ──────────────────────────── */}
          <div className="mt-6 rounded-xl bg-slate-50 px-5 py-4">
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">&#10003;</span>
                <span><strong>Fast månadskostnad</strong> — inga överraskande verkstadsräkningar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">&#10003;</span>
                <span><strong>Ny bil med garanti</strong> — du slipper oroa dig för att den inte startar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">&#10003;</span>
                <span><strong>Service och underhåll</strong> ingår ofta i leasingen</span>
              </li>
            </ul>
          </div>

          {/* ── 5. CTA ────────────────────────────────────────── */}
          <div className="mt-6 text-center">
            <Link
              href="/leasing"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow hover:bg-emerald-700 transition"
            >
              Se leasingerbjudanden &rarr;
            </Link>
          </div>
        </div>

        {/* ── 6. Förenklat stapeldiagram ──────────────────────── */}
        <div className="mt-8 rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-center text-base font-semibold text-slate-900">
            Månadskostnad — uppdelad
          </h2>
          <p className="mt-1 text-center text-sm text-slate-500">
            Staplarna visar att totalbeloppet ofta hamnar nära varandra, men elbilen har en enklare uppdelning.
          </p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={stackedBarData}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  domain={[0, "auto"]}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13, fill: "#334155" }}
                  width={120}
                />
                <Tooltip formatter={(v) => `${fmtShort(Number(v))} kr/mån`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Värdeminskning" stackId="a" fill="#f87171" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Bränsle/El" stackId="a" fill="#fb923c" />
                <Bar dataKey="Försäkring" stackId="a" fill="#a78bfa" />
                <Bar dataKey="Skatt & service" stackId="a" fill="#fbbf24" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-8 text-sm text-slate-600">
            <span>{fuel === "diesel" ? "Diesel" : "Bensin"}bil: <strong className="text-red-600">{fmtShort(used.total)} kr/mån</strong></span>
            <span>Elbil: <strong className="text-emerald-600">{fmtShort(evTotal)} kr/mån</strong></span>
          </div>
        </div>

        {/* ── 7. Trovärdighet + Metodik (expanderbart) ────────── */}
        <div className="mt-8 rounded-2xl border border-sky-300/40 bg-white shadow-sm">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between p-6 sm:p-8">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Kan det verkligen stämma?</h2>
                <p className="mt-1 text-sm text-slate-500">Läs om källorna bakom siffrorna och hur vi räknat.</p>
              </div>
              <span className="text-2xl text-slate-400 transition-transform duration-200 group-open:rotate-180">
                &#9660;
              </span>
            </summary>
            <div className="border-t border-slate-200 p-6 sm:p-8 space-y-6">
              {/* Sifo/KVD info box */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                <p className="text-sm font-semibold text-amber-900">
                  Visste du? Svenskar underskattar sina bilkostnader med upp till 3 000 kr/mån
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  Enligt en Sifo-undersökning (1 775 svarande) beställd av KVD Bilpriser tror de flesta att bilen kostar
                  betydligt mindre än den faktiskt gör. Den största blinda fläcken är värdeminskning, följt av service och
                  reparationer — som ökar markant efter garantitidens slut. M Sveriges bilkostnadskalkylator{" "}
                  <em>exkluderar</em> dessutom oväntade reparationer helt.
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-700">
                  <a href="https://www.vibilagare.se/nyheter/manga-tror-att-bilen-kostar-mindre-den-gor" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">Vi Bilägare / Sifo</a>
                  <a href="https://www.kvd.se/artiklar/kopguider/billigaste-bilarna-att-aga-2025" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">KVD – Billigaste bilarna att äga 2025</a>
                  <a href="https://msverige.se/allt-om-bilen/vad-kostar-det-att-ha-bil/sa-har-vi-raknat/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">M Sverige – Så har vi räknat</a>
                </div>
              </div>

              {/* How we calculated (used car) */}
              <div className="text-xs text-slate-600 space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">Så har vi räknat — din nuvarande bil</h3>
                <p>
                  Vi utgår från en <strong>5 år gammal {fuel === "diesel" ? "diesel" : "bensin"}bil</strong> i {VCS.find(v => v.v === vc)?.l.toLowerCase()}klassen,
                  köpt begagnad för ca {fmtShort(USED_CAR_DEFAULTS[vc].purchasePrice)} kr (marknadsvärde vid ~80 000 km).
                  Bilen behålls i 3 år och säljs vid ~8 års ålder.
                </p>
                <ul className="list-inside list-disc space-y-0.5">
                  <li><strong>Värdeminskning:</strong> ca {Math.round((1 - USED_CAR_DEFAULTS[vc].residualShareAfter3y) * 100)}% på 3 år — plattare kurva än nybil.</li>
                  <li><strong>Kapitalkostnad:</strong> {(DEFAULTS.capitalCostRate * 100).toFixed(1)}% ränta på genomsnittligt bundet kapital.</li>
                  <li><strong>Service &amp; reparation:</strong> {fmtShort(USED_CAR_DEFAULTS[vc].maintenanceAnnual)} kr/år inkl. service, däck och oväntade reparationer (som M Sveriges kalkyl exkluderar).</li>
                  <li><strong>Bränsle:</strong> baserat på din körsträcka ({fmtShort(miles)} mil/år) och valt bränslepris.</li>
                </ul>
                <p>
                  {!hasRealOffer && <>Leasingkostnaden för elbilen är uppskattad utifrån bilens pris, restvärde och {(LEASING_RATE * 100).toFixed(1)} % ränta ({LEASING_MONTHS} mån). </>}
                  Källor: KVD (mars 2025), M Sverige, Vi Bilägare / Sifo.
                </p>
              </div>

              {/* TCO methodology */}
              <div className="text-sm text-slate-700 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">Så har vi räknat — TCO-jämförelsen</h3>
                <p>
                  Vi jämför den totala ägandekostnaden (TCO) för en elbil och en fossildriven bil i
                  samma storleksklass. Strukturen följer samma modell som Teknikens Värld.
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li><strong>Värdeminskning</strong> — inköpspris minus uppskattat restvärde, fördelat per år.</li>
                  <li><strong>Kapitalkostnad</strong> — ränta på genomsnittligt bundet kapital ({(DEFAULTS.capitalCostRate * 100).toFixed(1)} %).</li>
                  <li><strong>Försäkring</strong> — typisk helförsäkring. Elbil kan vara något dyrare pga högre reparationskostnad.</li>
                  <li><strong>Fordonsskatt</strong> — elbilar saknar koldioxidkomponent och betalar ofta 360 kr/år.</li>
                  <li><strong>Service/underhåll</strong> — färre rörliga delar ger lägre servicekostnad för elbil.</li>
                  <li><strong>Energikostnad</strong> — el (hem + publikt) respektive bensin/diesel baserat på din körsträcka.</li>
                </ul>
                <p className="text-xs text-slate-500">
                  Källa för standardvärden: KVD (mars 2025), Teknikens Värld, Mobility Sweden, Transportstyrelsen. Alla belopp är genomsnitt per år under ägandeperioden.
                </p>
                <p className="text-xs text-slate-500">
                  Se även <a href="https://publikationer.konsumentverket.se/produkter-och-tjanster/bil-bat-och-motorcykel/jamforelse-av-drivmedelskostnader" target="_blank" rel="noopener noreferrer" className="font-medium text-sky-600 underline hover:text-sky-500">Konsumentverkets officiella jämförelse av drivmedelskostnader</a> (uppdateras kvartalsvis).
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* ── 8. Visa fullständig analys (expanderbar) ────────── */}
        <div className="mt-8 rounded-2xl border border-sky-300/40 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex w-full items-center justify-between p-6 text-left sm:p-8"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Visa fullständig analys</h2>
              <p className="mt-1 text-sm text-slate-500">TCO-jämförelse (ny elbil vs ny fossilbil), detaljerad tabell och finjustering.</p>
            </div>
            <span className={`text-2xl text-slate-400 transition-transform duration-200 ${detailsOpen ? "rotate-180" : ""}`}>
              &#9660;
            </span>
          </button>
          {detailsOpen && (
            <div className="border-t border-slate-200 p-6 sm:p-8 space-y-8">

              {/* TCO savings banner */}
              <div
                className={`rounded-2xl p-6 text-center shadow-lg ${
                  pos
                    ? "bg-gradient-to-br from-emerald-500 to-sky-600"
                    : "bg-gradient-to-br from-amber-500 to-orange-600"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">Ny elbil vs ny {fuel === "diesel" ? "diesel" : "bensin"}bil — TCO-jämförelse</p>
                {pos ? (
                  <>
                    <p className="mt-2 text-base font-medium text-emerald-100">Med elbil sparar du</p>
                    <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl">{fmt(r.savings.annual)}/år</p>
                    <p className="mt-2 text-emerald-100">
                      Det blir <strong className="text-white">{fmt(r.savings.period)}</strong> på {r.ownershipYears} år
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-base font-medium text-amber-100">Elbilen blir</p>
                    <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl">
                      {fmt(Math.abs(r.savings.annual))}/år dyrare
                    </p>
                    <p className="mt-2 text-amber-100">
                      Testa andra värden — kanske ändrar det bilden?
                    </p>
                  </>
                )}
              </div>

              {/* Quick stats cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-sky-300/40 bg-white p-5 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Kostnad per månad</p>
                  <div className="mt-2 flex items-center justify-center gap-4">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{fmtShort(r.ev.monthlyTotal)}</p>
                      <p className="text-xs text-slate-500">Elbil</p>
                    </div>
                    <span className="text-slate-300">vs</span>
                    <div>
                      <p className="text-2xl font-bold text-red-500">{fmtShort(r.fossil.monthlyTotal)}</p>
                      <p className="text-xs text-slate-500">{fuel === "diesel" ? "Diesel" : "Bensin"}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-sky-300/40 bg-white p-5 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Kostnad per mil</p>
                  <div className="mt-2 flex items-center justify-center gap-4">
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{r.ev.costPerMile.toFixed(1)}</p>
                      <p className="text-xs text-slate-500">kr/mil</p>
                    </div>
                    <span className="text-slate-300">vs</span>
                    <div>
                      <p className="text-2xl font-bold text-red-500">{r.fossil.costPerMile.toFixed(1)}</p>
                      <p className="text-xs text-slate-500">kr/mil</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-sky-300/40 bg-white p-5 text-center shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total besparing</p>
                  <p className={`mt-2 text-2xl font-bold ${pos ? "text-emerald-600" : "text-red-500"}`}>
                    {fmt(r.savings.period)}
                  </p>
                  <p className="text-xs text-slate-500">på {r.ownershipYears} år</p>
                </div>
              </div>

              {/* Detailed table */}
              <div className="overflow-hidden rounded-2xl border border-sky-300/40">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-900">Detaljerad kostnadsjämförelse</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Genomsnitt baserat på {r.ownershipYears} års ägande, {fmtShort(miles)} mil/år
                  </p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase text-slate-500">
                      <th className="px-6 py-3"></th>
                      <th className="px-6 py-3 text-right">Elbil</th>
                      <th className="px-6 py-3 text-right">{fuel === "diesel" ? "Diesel" : "Bensin"}</th>
                      <th className="hidden px-6 py-3 text-right sm:table-cell">Skillnad</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-900">Inköpspris</td>
                      <td className="px-6 py-3 text-right">{fmt(r.ev.purchasePrice)}</td>
                      <td className="px-6 py-3 text-right">{fmt(r.fossil.purchasePrice)}</td>
                      <td className="hidden px-6 py-3 text-right sm:table-cell">{fmt(r.ev.purchasePrice - r.fossil.purchasePrice)}</td>
                    </tr>
                    {[
                      { l: "Värdeminskning per år", ev: r.ev.depreciationAnnual, fo: r.fossil.depreciationAnnual },
                      { l: "Kapitalkostnad per år", ev: r.ev.capitalCostAnnual, fo: r.fossil.capitalCostAnnual },
                      { l: "Försäkring per år", ev: r.ev.insuranceAnnual, fo: r.fossil.insuranceAnnual },
                      { l: "Fordonsskatt per år", ev: r.ev.taxAnnual, fo: r.fossil.taxAnnual },
                      { l: "Service/underhåll per år", ev: r.ev.maintenanceFundAnnual, fo: r.fossil.maintenanceFundAnnual },
                      { l: "Energikostnad per år", ev: r.ev.energyAnnual, fo: r.fossil.energyAnnual },
                    ].map((x) => {
                      const diff = x.ev - x.fo;
                      return (
                        <tr key={x.l} className="border-b border-slate-100">
                          <td className="px-6 py-3 text-slate-700">{x.l}</td>
                          <td className="px-6 py-3 text-right">{fmt(x.ev)}</td>
                          <td className="px-6 py-3 text-right">{fmt(x.fo)}</td>
                          <td className={`hidden px-6 py-3 text-right font-medium sm:table-cell ${diff < 0 ? "text-emerald-600" : diff > 0 ? "text-red-500" : ""}`}>
                            {diff < 0 ? "−" : "+"}{fmt(Math.abs(diff))}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
                      <td className="px-6 py-3">Totalkostnad per år</td>
                      <td className="px-6 py-3 text-right">{fmt(r.ev.annualTotal)}</td>
                      <td className="px-6 py-3 text-right">{fmt(r.fossil.annualTotal)}</td>
                      <td className={`hidden px-6 py-3 text-right sm:table-cell ${pos ? "text-emerald-600" : "text-red-500"}`}>
                        {pos ? "−" : "+"}{fmt(Math.abs(r.savings.annual))}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                      <td className="px-6 py-3">Kostnad per månad</td>
                      <td className="px-6 py-3 text-right">{fmt(r.ev.monthlyTotal)}</td>
                      <td className="px-6 py-3 text-right">{fmt(r.fossil.monthlyTotal)}</td>
                      <td className={`hidden px-6 py-3 text-right sm:table-cell ${pos ? "text-emerald-600" : "text-red-500"}`}>
                        {pos ? "−" : "+"}{fmt(Math.abs(r.savings.annual / 12))}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                      <td className="px-6 py-3">Kostnad per mil</td>
                      <td className="px-6 py-3 text-right">{r.ev.costPerMile.toFixed(2)} kr</td>
                      <td className="px-6 py-3 text-right">{r.fossil.costPerMile.toFixed(2)} kr</td>
                      <td className={`hidden px-6 py-3 text-right sm:table-cell ${pos ? "text-emerald-600" : "text-red-500"}`}>
                        {pos ? "−" : "+"}{Math.abs(r.savings.perMile).toFixed(2)} kr
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Finetune section */}
              <div>
                <h3 className="text-base font-semibold text-slate-900">Finjustera beräkningen</h3>
                <p className="mt-1 text-sm text-slate-500">Välj specifika bilmodeller, justera priser och energikostnader.</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Välj elbil</label>
                    <select
                      value={selectedEv?.id ?? ""}
                      onChange={(e) => handleEvSelect(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Generisk elbil ({VCS.find(v => v.v === vc)?.l})</option>
                      {EV_MODELS.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.brand} {m.model} – {fmtShort(m.priceSek)} kr
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Jämför med fossilbil</label>
                    <select
                      value={selectedFossil?.id ?? ""}
                      onChange={(e) => handleFossilSelect(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Generisk {fuel === "diesel" ? "diesel" : "bensin"}bil ({VCS.find(v => v.v === vc)?.l})</option>
                      {FOSSIL_MODELS.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.brand} {m.model} – {fmtShort(m.priceSek)} kr
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <Slider
                    label="Ägandeperiod"
                    value={years}
                    min={1}
                    max={8}
                    step={1}
                    unit="år"
                    onChange={setYears}
                  />
                  <Slider
                    label={selectedEv ? `Pris ${selectedEv.brand} ${selectedEv.model}` : "Inköpspris elbil"}
                    value={evPrice}
                    min={150_000}
                    max={900_000}
                    step={10_000}
                    unit="kr"
                    onChange={setEvPrice}
                  />
                  <Slider
                    label={selectedFossil ? `Pris ${selectedFossil.brand} ${selectedFossil.model}` : `Inköpspris ${fuel === "diesel" ? "diesel" : "bensin"}bil`}
                    value={fossilPrice}
                    min={100_000}
                    max={700_000}
                    step={10_000}
                    unit="kr"
                    onChange={setFossilPrice}
                  />
                  <Slider
                    label="Elpris (hemma)"
                    value={elPrice}
                    min={0.5}
                    max={5}
                    step={0.1}
                    unit="kr/kWh"
                    onChange={setElPrice}
                    formatValue={(v) => v.toFixed(1)}
                  />
                  <Slider
                    label={fuel === "diesel" ? "Dieselpris" : "Bensinpris"}
                    value={gasPrice}
                    min={12}
                    max={28}
                    step={0.5}
                    unit="kr/L"
                    onChange={setGasPrice}
                    formatValue={(v) => v.toFixed(1)}
                  />
                  {homeCharge && (
                    <Slider
                      label="Andel hemmaladdning"
                      value={homeShare}
                      min={0}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={setHomeShare}
                    />
                  )}
                </div>

                <div className="mt-6">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={homeCharge}
                      onChange={(e) => setHomeCharge(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-sky-600"
                    />
                    Jag kan ladda hemma
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 9. Avslutande CTA ───────────────────────────────── */}
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
