import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ladda elbil – Guide till hemmaladdning och snabbladdning",
  description:
    "Allt om laddning av elbil: hemmaladdning, snabbladdning, kostnader och tips. Jämför hemma-el, snabbladdare och bensin.",
  alternates: { canonical: "https://elbilskompassen.se/laddning" },
};

const SECTIONS = [
  { icon: "\u{1F3E0}", title: "Hemmaladdning", desc: "80 % av alla elbilsagare laddar hemma via en laddbox (Typ 2).", details: ["Totalkostnad: ca 1,5\u20132,5 kr/kWh (inkl. nat och skatt)", "Laddbox installation: 15 000\u201325 000 kr", "Full varje morgon", "10 mil for ca 25\u201340 kr"] },
  { icon: "\u26A1", title: "Publik snabbladdning", desc: "Snabbladdare (DC) langs motorvagar. Perfekt for resor.", details: ["Effekt: 50\u2013350 kW (CCS)", "Kostnad: ca 4\u20136 kr/kWh", "10\u219280 % pa 18\u201335 min", "Ionity, Recharge, Supercharger"] },
  { icon: "\u{1F3E2}", title: "Arbetsplatsladdning", desc: "Allt fler arbetsgivare erbjuder laddning.", details: ["Typ 2 (AC) pa 7\u201322 kW", "Ladda medan du jobbar", "Ofta gratis eller sjalvkostnad"] },
];

export default function LaddningPage() {
  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">Startsida</Link>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Ladda elbil</h1>
        <p className="mt-2 text-lg text-slate-200">Allt du behover veta om laddning, kostnader och tips.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-sky-300/40 bg-white/95 p-6 shadow-sm">
              <span className="text-3xl">{s.icon}</span>
              <h2 className="mt-3 text-lg font-bold text-slate-900">{s.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              <ul className="mt-4 space-y-2">
                {s.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-sky-300/40 bg-white/95 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Kostnad per 10 mil</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-5 text-center">
              <p className="text-sm font-medium text-emerald-800">Hemmaladdning</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">~35 kr</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-5 text-center">
              <p className="text-sm font-medium text-amber-800">Snabbladdning</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">~100 kr</p>
            </div>
            <div className="rounded-xl bg-red-50 p-5 text-center">
              <p className="text-sm font-medium text-red-800">Bensin</p>
              <p className="mt-2 text-3xl font-bold text-red-600">~125 kr</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Baserat pa ~2 kWh/mil (snitt for en typisk elbil), hemma-el ~1,8 kr/kWh (inkl. nat, skatt, spot), snabbladdning ~5 kr/kWh, och bensin ~18 kr/L vid 0,7 L/mil. Verklig kostnad varierar med elpris, korning och bilmodell.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-sky-300/40 bg-white/95 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Officiell jamforelse fran Konsumentverket</h2>
          <p className="mt-3 text-sm text-slate-700">
            Konsumentverket publicerar varje kvartal en officiell jamforelse av drivmedelskostnader per 100 km for de mest salda bilmodellerna i Sverige. Det ar den mest tillforlitliga kallan for att jamfora vad det faktiskt kostar att kora elbil, bensin, diesel och laddhybrid.
          </p>
          <a
            href="https://publikationer.konsumentverket.se/produkter-och-tjanster/bil-bat-och-motorcykel/jamforelse-av-drivmedelskostnader"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-sky-500"
          >
            Se Konsumentverkets jamforelse
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.25-.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V6.31l-5.47 5.47a.75.75 0 1 1-1.06-1.06l5.47-5.47H12.25a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>
          </a>
          <p className="mt-3 text-xs text-slate-500">Kalla: Konsumentverket, uppdateras kvartalsvis. Senaste utgava: december 2025.</p>
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white">Vill du veta vad du sparar?</h2>
          <p className="mt-2 text-emerald-100">Jamfor elbil med din nuvarande bil.</p>
          <Link href="/kalkyl" className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">Rakna pa ekonomin</Link>
        </div>
      </div>
    </main>
  );
}
