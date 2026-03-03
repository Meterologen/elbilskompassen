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
import {
  PieChart,
  Pie,
  Cell,
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

const PIE_COLORS_EV = ["#10b981", "#06b6d4", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6"];
const PIE_COLORS_FOSSIL = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#14b8a6", "#6366f1"];

const VCS: { v: VehicleClass; l: string; icon: string }[] = [
  { v: "small", l: "Kompakt", icon: "🚗" },
  { v: "medium", l: "Mellanklass", icon: "🚙" },
  { v: "large", l: "Stor / SUV", icon: "🚐" },
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieLabel(props: any) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const innerRadius = Number(props.innerRadius ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const percent = Number(props.percent ?? 0);
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
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

function Inner() {
  const sp = useSearchParams();
  const urlEvPrice = sp.get("evPrice") || "";
  const urlEvModel = sp.get("evModel") || "";
  const pk = sp.get("evKwhPerMile") || "";

  const initVc: VehicleClass = "medium";
  const [miles, setMiles] = useState<number>(DEFAULTS.annualMiles);
  const [years, setYears] = useState<number>(DEFAULTS.ownershipYears);
  const [vc, setVc] = useState<VehicleClass>(initVc);

  const [selectedEv, setSelectedEv] = useState<EvModel | null>(
    urlEvModel ? EV_MODELS.find(m => `${m.brand} ${m.model}` === urlEvModel) ?? null : null
  );
  const [selectedFossil, setSelectedFossil] = useState<FossilModel | null>(null);

  const [evPrice, setEvPrice] = useState<number>(
    urlEvPrice ? Number(urlEvPrice) : classDefaults(initVc).ev.purchasePrice
  );
  const [fossilPrice, setFossilPrice] = useState<number>(classDefaults(initVc).fossil.purchasePrice);
  const [homeCharge, setHomeCharge] = useState(true);
  const [homeShare, setHomeShare] = useState<number>(DEFAULTS.electricity.homeChargingSharePct);
  const [elPrice, setElPrice] = useState<number>(DEFAULTS.electricity.homeOrePerKwh / 100);
  const [gasPrice, setGasPrice] = useState<number>(DEFAULTS.fossilFuel.petrolSekPerLiter);
  const [fuel, setFuel] = useState<"petrol" | "diesel">("petrol");

  const handleVcChange = (newVc: VehicleClass) => {
    setVc(newVc);
    setSelectedEv(null);
    setSelectedFossil(null);
    const cd = classDefaults(newVc);
    setEvPrice(cd.ev.purchasePrice);
    setFossilPrice(cd.fossil.purchasePrice);
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

  const evPie = costBreakdown(r.ev);
  const fossilPie = costBreakdown(r.fossil);
  const barData = [
    { name: "Värdeminskning", Elbil: r.ev.depreciationAnnual, Fossil: r.fossil.depreciationAnnual },
    { name: "Kapital", Elbil: r.ev.capitalCostAnnual, Fossil: r.fossil.capitalCostAnnual },
    { name: "Försäkring", Elbil: r.ev.insuranceAnnual, Fossil: r.fossil.insuranceAnnual },
    { name: "Skatt", Elbil: r.ev.taxAnnual, Fossil: r.fossil.taxAnnual },
    { name: "Underhåll", Elbil: r.ev.maintenanceFundAnnual, Fossil: r.fossil.maintenanceFundAnnual },
    { name: "Energi", Elbil: r.ev.energyAnnual, Fossil: r.fossil.energyAnnual },
  ];

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-sky-300 hover:text-sky-200 hover:underline">Startsida</Link>
          <Link href="/kompassen" className="text-sky-300 hover:text-sky-200 hover:underline">Elbilskompassen</Link>
        </nav>

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Räkna på elbil vs fossildrift
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-200">
            Dra i reglagen och se direkt hur kostnaden förändras.
          </p>
        </div>

        {urlEvModel && (
          <div className="mt-6 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-200">
            Vi har fyllt i uppgifter för <strong className="text-white">{urlEvModel}</strong> åt dig.
          </div>
        )}

        {/* ── Savings banner ─────────────────────────────────── */}
        <div
          className={`mt-8 rounded-2xl p-6 text-center shadow-lg transition-all duration-300 sm:p-8 ${
            pos
              ? "bg-gradient-to-br from-emerald-500 to-sky-600"
              : "bg-gradient-to-br from-amber-500 to-orange-600"
          }`}
        >
          {pos ? (
            <>
              <p className="text-base font-medium text-emerald-100">Med elbil sparar du</p>
              <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl">{fmt(r.savings.annual)}/år</p>
              <p className="mt-2 text-emerald-100">
                Det blir <strong className="text-white">{fmt(r.savings.period)}</strong> på {r.ownershipYears} år
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-amber-100">Elbilen blir</p>
              <p className="mt-1 text-4xl font-extrabold text-white sm:text-5xl">
                {fmt(Math.abs(r.savings.annual))}/år dyrare
              </p>
              <p className="mt-2 text-amber-100">
                Testa andra värden – kanske ändrar det bilden?
              </p>
            </>
          )}
        </div>

        {/* ── Sliders ────────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Anpassa dina värden</h2>
          <p className="mt-1 text-sm text-slate-500">Dra i reglagen – resultaten uppdateras direkt.</p>

          {/* Model selectors */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

          {/* Vehicle class selector */}
          <div className="mt-5">
            <span className="text-sm font-medium text-slate-700">Bilklass</span>
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

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Slider
              label="Körsträcka"
              value={miles}
              min={200}
              max={4000}
              step={50}
              unit="mil/år"
              onChange={setMiles}
            />
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

          {/* Toggles row */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={homeCharge}
                onChange={(e) => setHomeCharge(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-sky-600"
              />
              Jag kan ladda hemma
            </label>
            <div className="flex items-center gap-2 text-sm text-slate-700">
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
        </div>

        {/* ── Quick stats cards ──────────────────────────────── */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
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

        {/* ── Leasing comparison ─────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Privatleasing – uppskattad månadskostnad</h2>
          <p className="mt-1 text-sm text-slate-500">
            Beräknat på {LEASING_MONTHS} månader, {(LEASING_RATE * 100).toFixed(1)} % ränta. Exkl. serviceavtal.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
                Elbil{selectedEv ? ` – ${selectedEv.brand} ${selectedEv.model}` : ""}
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">
                {fmtShort(Math.round(leasingMonthly(evPrice, r.ev.residualValue / evPrice)))} kr/mån
              </p>
              <div className="mt-3 space-y-1 text-xs text-emerald-800">
                <p>+ Energi: ~{fmtShort(Math.round(r.ev.energyAnnual / 12))} kr/mån</p>
                <p>+ Försäkring: ~{fmtShort(Math.round(r.ev.insuranceAnnual / 12))} kr/mån</p>
                <p className="border-t border-emerald-200 pt-1 font-semibold">
                  Totalt: ~{fmtShort(Math.round(leasingMonthly(evPrice, r.ev.residualValue / evPrice) + r.ev.energyAnnual / 12 + r.ev.insuranceAnnual / 12))} kr/mån
                </p>
              </div>
            </div>
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-red-700">
                {fuel === "diesel" ? "Diesel" : "Bensin"}{selectedFossil ? ` – ${selectedFossil.brand} ${selectedFossil.model}` : ""}
              </p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {fmtShort(Math.round(leasingMonthly(fossilPrice, r.fossil.residualValue / fossilPrice)))} kr/mån
              </p>
              <div className="mt-3 space-y-1 text-xs text-red-800">
                <p>+ Bränsle: ~{fmtShort(Math.round(r.fossil.energyAnnual / 12))} kr/mån</p>
                <p>+ Försäkring: ~{fmtShort(Math.round(r.fossil.insuranceAnnual / 12))} kr/mån</p>
                <p className="border-t border-red-200 pt-1 font-semibold">
                  Totalt: ~{fmtShort(Math.round(leasingMonthly(fossilPrice, r.fossil.residualValue / fossilPrice) + r.fossil.energyAnnual / 12 + r.fossil.insuranceAnnual / 12))} kr/mån
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Uppskattningen baseras på bilens pris, beräknat restvärde och en antagen ränta. Faktiska leasingerbjudanden kan avvika – kontakta återförsäljare för skarpa offerter.
          </p>
        </div>

        {/* ── Charts ─────────────────────────────────────────── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Pie: Elbil */}
          <div className="rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm">
            <h3 className="text-center text-sm font-semibold text-slate-900">Kostnadsfördelning – Elbil</h3>
            <p className="text-center text-xs text-slate-500">{fmt(r.ev.annualTotal)}/år</p>
            <div className="mt-2 flex justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={evPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {evPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS_EV[i % PIE_COLORS_EV.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
              {evPie.map((item, i) => (
                <span key={item.name} className="flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS_EV[i] }}
                  />
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          {/* Pie: Fossil */}
          <div className="rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm">
            <h3 className="text-center text-sm font-semibold text-slate-900">
              Kostnadsfördelning – {fuel === "diesel" ? "Diesel" : "Bensin"}
            </h3>
            <p className="text-center text-xs text-slate-500">{fmt(r.fossil.annualTotal)}/år</p>
            <div className="mt-2 flex justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={fossilPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel}
                  >
                    {fossilPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS_FOSSIL[i % PIE_COLORS_FOSSIL.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
              {fossilPie.map((item, i) => (
                <span key={item.name} className="flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS_FOSSIL[i] }}
                  />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart comparison */}
        <div className="mt-6 rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm">
          <h3 className="text-center text-sm font-semibold text-slate-900">Kostnadsjämförelse per kategori (kr/år)</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend />
                <Bar dataKey="Elbil" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fossil" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Detailed table ─────────────────────────────────── */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-sky-300/40 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Detaljerad kostnadsjämförelse</h2>
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

        {/* ── CTA ────────────────────────────────────────────── */}
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

        {/* ── Methodology ────────────────────────────────────── */}
        <section className="mt-16 rounded-2xl border border-sky-300/40 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Så har vi räknat</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p>
              Vi jämför den totala ägandekostnaden (TCO) för en elbil och en fossildriven bil i
              samma storleksklass. Strukturen följer samma modell som Teknikens Värld.
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Värdeminskning</strong> &ndash; inköpspris minus uppskattat restvärde, fördelat per år.</li>
              <li><strong>Kapitalkostnad</strong> &ndash; ränta på genomsnittligt bundet kapital ({(DEFAULTS.capitalCostRate * 100).toFixed(1)} %).</li>
              <li><strong>Försäkring</strong> &ndash; typisk helförsäkring. Elbil kan vara något dyrare pga högre reparationskostnad.</li>
              <li><strong>Fordonsskatt</strong> &ndash; elbilar saknar koldioxidkomponent och betalar ofta 360 kr/år.</li>
              <li><strong>Service/underhåll</strong> &ndash; färre rörliga delar ger lägre servicekostnad för elbil.</li>
              <li><strong>Energikostnad</strong> &ndash; el (hem + publikt) respektive bensin/diesel baserat på din körsträcka.</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              Källa för standardvärden: KVD (mars 2025), Teknikens Värld, Mobility Sweden, Transportstyrelsen. Alla belopp är genomsnitt per år under ägandeperioden.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Se även <a href="https://publikationer.konsumentverket.se/produkter-och-tjanster/bil-bat-och-motorcykel/jamforelse-av-drivmedelskostnader" target="_blank" rel="noopener noreferrer" className="font-medium text-sky-600 underline hover:text-sky-500">Konsumentverkets officiella jämförelse av drivmedelskostnader</a> (uppdateras kvartalsvis).
            </p>
          </div>
        </section>
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
