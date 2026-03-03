import Link from "next/link";

const PERSONAS = [
  { name: "Lisa & Erik", location: "Göteborg", who: "Småbarnsfamilj med 2 barn", previousCar: "Volvo V60 diesel", newCar: "Tesla Model Y", worry: "Vi var oroliga för värdeminskningen och hur det skulle funka att ladda på längre resor med barnen.", quote: "Vi var livrädda för värdeminskningen. Nu sparar vi 22 000 kr om året och barnen älskar hur tyst det är.", result: "Familjen sparar 22 000 kr/år i driftskostnad. De laddar hemma varje natt via sin laddbox och har gjort roadtrip till Norge utan problem tack vare Teslas Supercharger-nätverk.", emoji: "👨‍👩‍👧‍👦", savings: "22 000 kr/år" },
  { name: "Anders", location: "Västerås", who: "Pendlare – kör 8 mil per dag till jobbet", previousCar: "VW Golf bensin", newCar: "Kia EV6", worry: "Jag var skeptisk till räckvidden i kyla och orolig för den totala ekonomin.", quote: "Jag trodde det skulle bli krångligt att ladda. Men jag pluggar in hemma varje kväll – enklare än att tanka.", result: "Anders sparar 28 000 kr/år. Räckvidden räcker gott och väl även i -15°C. Han laddar hemma på natten och fyller på på jobbet där arbetsgivaren erbjuder fri laddning.", emoji: "🚗", savings: "28 000 kr/år" },
  { name: "Birgitta", location: "Lund", who: "Pensionär – kör ca 500 mil per år", previousCar: "Toyota Yaris", newCar: "Volvo EX30", worry: "Jag var rädd att tekniken skulle vara för krånglig och att det inte var värt det för någon som kör så lite.", quote: "Min Volvo EX30 är den smidigaste bilen jag ägt. Och den billigaste att köra.", result: "Birgitta sparar 8 000 kr/år trots att hon kör relativt lite. Bilen är enklare att hantera än hennes gamla bensinbil – inga verkstadsbesök, inga oljbyten, bara köra.", emoji: "👵", savings: "8 000 kr/år" },
];

export default function BerattelserPage() {
  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">← Startsida</Link>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">De vågade – och ångrar sig inte</h1>
        <p className="mt-2 text-lg text-slate-200">Tre vanliga svenskar som bytte till elbil. Så gick det.</p>
        <div className="mt-10 space-y-8">
          {PERSONAS.map((p) => (
            <div key={p.name} className="overflow-hidden rounded-2xl border border-sky-300/40 bg-white/95 shadow-sm">
              <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-4">
                <span className="text-4xl">{p.emoji}</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{p.name}, {p.location}</h2>
                  <p className="text-sm text-slate-600">{p.who}</p>
                </div>
                <div className="ml-auto rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">Sparar {p.savings}</div>
              </div>
              <div className="p-6">
                <blockquote className="rounded-xl bg-sky-50 p-4 text-sm italic text-slate-700">&ldquo;{p.quote}&rdquo;</blockquote>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hade innan</p><p className="mt-1 font-medium text-slate-800">{p.previousCar}</p></div>
                  <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Bytte till</p><p className="mt-1 font-medium text-emerald-800">{p.newCar}</p></div>
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Oron innan</p><p className="mt-1 text-sm text-amber-800">{p.worry}</p></div>
                <div className="mt-4 rounded-xl bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Resultat</p><p className="mt-1 text-sm text-emerald-800">{p.result}</p></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Vill du veta vilken elbil som passar dig?</h2>
          <p className="mt-2 text-emerald-100">Svara på 10 frågor – vi matchar dig med rätt bil.</p>
          <Link href="/kompassen" className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">Starta Elbilskompassen</Link>
        </div>
      </div>
    </main>
  );
}
