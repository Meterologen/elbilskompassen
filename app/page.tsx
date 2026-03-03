import Link from "next/link";
import HomeChat from "./components/HomeChat";

const WORRIES = [
  { icon: "💰", title: "Blir det dyrare?", text: "De flesta sparar 10 000–30 000 kr/år i driftskostnad jämfört med bensin/diesel." },
  { icon: "📉", title: "Värdeminskning?", text: "Elbilar håller värdet bättre än många tror – och det förbättras varje år." },
  { icon: "🔋", title: "Räcker elen?", text: "Genomsnittlig daglig körsträcka i Sverige: 4 mil. De flesta elbilar klarar 40–55 mil." },
  { icon: "⚡", title: "Var laddar jag?", text: "80 % laddar hemma. Publikt laddnät växer snabbt – 25 000+ laddpunkter i Sverige." },
  { icon: "🔧", title: "Teknikskifte?", text: "Litiumbatterier har 8–15 års garanti. Tekniken är mogen – inte experimentell." },
  { icon: "🤔", title: "Krångligt att byta?", text: "Elbilskompassen hjälper dig hitta rätt bil på 2 minuter. Resten löser sig." },
];

export default function Home() {
  return (
    <main id="main-content" className="relative overflow-hidden text-slate-100" role="main">
      {/* Hero with AI Chat */}
      <HomeChat />

      {/* Social proof */}
      <section className="border-t border-sky-300/30 bg-white/5 py-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-sm text-slate-300">
          <span>100 000 nya elbilar registrerades 2025</span>
          <span className="hidden sm:inline">·</span>
          <span>36 % av alla nya bilar är eldrivna</span>
          <span className="hidden sm:inline">·</span>
          <span>Upp till 20 000 kr/år lägre driftskostnad</span>
        </div>
      </section>

      {/* Oron – adressera osäkerheten */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Vi vet vad du oroar dig för</h2>
          <p className="mt-2 text-slate-200">Det här är de vanligaste frågorna – och svaren är lugnande.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORRIES.map((w) => (
            <div key={w.title} className="rounded-2xl border border-sky-300/40 bg-white/95 p-6 shadow-sm text-slate-900">
              <span className="text-2xl">{w.icon}</span>
              <h3 className="mt-3 font-semibold text-slate-800">{w.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{w.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/myter" className="text-sm font-medium text-sky-300 hover:text-sky-200 hover:underline">
            Läs fler myter vs fakta →
          </Link>
        </div>
      </section>

      {/* Så funkar det */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Tre steg till rätt elbil</h2>
        </div>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { n: 1, title: "Gör Elbilskompassen", desc: "Svara på 10 frågor – vi matchar dig med bilar som passar din vardag." },
            { n: 2, title: "Räkna på ekonomin", desc: "Se exakt vad du sparar (eller betalar extra) jämfört med din nuvarande bil." },
            { n: 3, title: "Ta nästa steg", desc: "Boka provkörning, begär offert eller jämför priser – vi kopplar dig rätt." },
          ].map(({ n, title, desc }) => (
            <li key={n} className="relative rounded-2xl border border-sky-300/50 bg-white p-6 shadow-sm text-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-sm font-bold text-white shadow">{n}</span>
              <h3 className="mt-4 font-semibold text-slate-800">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Berättelser – kort smakprov */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">De vågade – och ångrar sig inte</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { name: "Lisa & Erik, Göteborg", who: "Småbarnsfamilj", quote: "Vi var livrädda för värdeminskningen. Nu sparar vi 22 000 kr/år och barnen älskar tystnaden." },
            { name: "Anders, Västerås", who: "Pendlare, 8 mil/dag", quote: "Jag trodde det skulle bli krångligt att ladda. Men jag pluggar in hemma varje kväll – enklare än att tanka." },
            { name: "Birgitta, Lund", who: "Pensionär", quote: "Min Volvo EX30 är den smidigaste bilen jag ägt. Och billigaste att köra." },
          ].map((p) => (
            <div key={p.name} className="rounded-2xl border border-sky-300/40 bg-white/95 p-6 shadow-sm text-slate-900">
              <p className="text-sm italic text-slate-600">&ldquo;{p.quote}&rdquo;</p>
              <p className="mt-4 font-semibold text-slate-800">{p.name}</p>
              <p className="text-xs text-slate-500">{p.who}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/berattelser" className="text-sm font-medium text-sky-300 hover:text-sky-200 hover:underline">
            Läs fler berättelser →
          </Link>
        </div>
      </section>

      {/* CTA-block */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl sm:p-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Redo att ta reda på vilken elbil som passar dig?</h2>
          <p className="mt-4 text-emerald-100">10 frågor. 2 minuter. Personlig rekommendation.</p>
          <Link
            href="/kompassen"
            className="mt-6 inline-block rounded-full bg-white px-8 py-4 text-lg font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600"
          >
            Starta Elbilskompassen
          </Link>
        </div>
      </section>

      {/* Förtroende */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border border-sky-300/40 bg-white/95 p-8 shadow-sm text-slate-900">
          <h2 className="text-xl font-semibold text-slate-800">Byggt för förtroende – inte försäljning</h2>
          <p className="mt-4 text-slate-700">
            <strong>Vi säljer inga bilar.</strong> Vi hjälper dig fatta ett klokt beslut med tydliga siffror och ärliga jämförelser. Tänk oss som en kompis som redan gjort bytet och delar med sig – utan baktanke.
          </p>
        </div>
      </section>
    </main>
  );
}
