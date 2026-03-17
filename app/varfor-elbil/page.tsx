import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Varför välja elbil? Sex skäl att byta",
  description:
    "Billigare drift, lägre skatt, bättre för miljön – sex anledningar att välja elbil. Läs mer på Elbilskompassen.",
  alternates: { canonical: "https://elbilskompassen.se/varfor-elbil" },
};

const REASONS = [
  { icon: "\u{1F4B0}", title: "Billigare i drift", text: "El kostar 1-2 kr/mil, bensin 10-12 kr/mil. Pa 1 500 mil/ar sparar du 10 000-30 000 kr." },
  { icon: "\u{1F30D}", title: "Battre for miljon", text: "Noll avgaser fran bilen. Aven med svensk elmix ar klimatpaverkan 70-80 % lagre an fossil." },
  { icon: "\u{1F527}", title: "Lagre underhall", text: "Farre rorliga delar: inga oljbyten, farre bromsbyten, langre serviceintervall." },
  { icon: "\u{1F4C9}", title: "Lagre skatt", text: "Elbilar betalar ingen koldioxidkomponent - ofta 750 kr/ar istallet for 3 000-6 000 kr." },
  { icon: "\u26A1", title: "Roligare att kora", text: "Direkt vridmoment, tyst och smooth. De flesta som provkor blir foraldade." },
  { icon: "\u{1F50B}", title: "Tekniken ar mogen", text: "8-15 ars batterigaranti. 25 000+ laddpunkter i Sverige. Det ar inte langre experimentellt." },
];

export default function VarforElbilPage() {
  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">Startsida</Link>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Varfor valja elbil?</h1>
        <p className="mt-2 text-lg text-slate-200">Sex anledningar som gor det svart att saga nej.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {REASONS.map((r) => (
            <div key={r.title} className="rounded-2xl border border-sky-300/40 bg-white/10 backdrop-blur-sm p-6">
              <span className="text-3xl">{r.icon}</span>
              <h2 className="mt-3 text-lg font-bold text-white">{r.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{r.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white">Overtalad?</h2>
          <p className="mt-2 text-emerald-100">Hitta din elbil pa 2 minuter.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/kompassen" className="rounded-full bg-white px-6 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">Starta Elbilskompassen</Link>
            <Link href="/kalkyl" className="rounded-full border-2 border-white/80 px-6 py-3 font-semibold text-white hover:bg-white/10">Rakna pa ekonomin</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
