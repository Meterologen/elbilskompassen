import Link from "next/link";

const MYTHS = [
  { myth: "Elbilar är för dyra", fact: "Nypriset har sjunkit kraftigt. Räknar du in lägre driftskostnad blir totalkostnaden (TCO) ofta lägre än bensin redan efter 2–3 år." },
  { myth: "Batteriet dör efter 5 år", fact: "De flesta tillverkare ger 8–15 års garanti. Moderna batterier behåller 70–80 % kapacitet efter 200 000 km." },
  { myth: "Det finns ingen laddinfrastruktur", fact: "Sverige har över 25 000 publika laddpunkter. 80 % laddar hemma, så publik laddning behövs mest på resor." },
  { myth: "Elen räcker inte", fact: "Om hela Sveriges bilflotta vore elektrisk ökar elanvändningen med ca 10 %. Idag: ca 2 % av total elförbrukning." },
  { myth: "Elbilar brinner lätt", fact: "Statistik visar lägre brandrisk per körd km jämfört med fossildrivna bilar." },
  { myth: "Elbilar är dåliga i kyla", fact: "Räckvidden kan minska 10–30 %, men med förvärmning fungerar bilen utmärkt. Tusentals ägare i Norrland." },
  { myth: "Elbilar tappar allt värde", fact: "Andrahandsvärdena förbättras. Tesla Model 3 och Volvo EX30 håller värdet bra." },
  { myth: "Det är bättre att vänta", fact: "Priserna sjunker, laddnätverket växer och besparingarna börjar dag 1." },
];

export default function MyterPage() {
  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">Startsida</Link>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Myter vs Fakta om elbilar</h1>
        <p className="mt-2 text-lg text-slate-200">De vanligaste missförstånden – och sanningen.</p>
        <div className="mt-10 space-y-6">
          {MYTHS.map((m, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-sky-300/40 bg-white/95 shadow-sm">
              <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-6 py-4">
                <span className="mt-0.5 text-lg text-red-500">{"\u2717"}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Myt</p>
                  <p className="font-semibold text-red-800">{m.myth}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 px-6 py-4">
                <span className="mt-0.5 text-lg text-emerald-500">{"\u2713"}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Fakta</p>
                  <p className="text-sm text-slate-700">{m.fact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white">Redo att hitta din elbil?</h2>
          <p className="mt-2 text-emerald-100">Svara på 15 frågor – vi matchar dig med bilar som passar.</p>
          <Link href="/kompassen" className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">Starta Elbilskompassen</Link>
        </div>
      </div>
    </main>
  );
}
