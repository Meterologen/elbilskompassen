import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Begär offert – Kommer snart",
  robots: { index: false, follow: false },
};

export default function OffertPage() {
  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
        <Link href="/kompassen" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">
          ← Tillbaka till Elbilskompassen
        </Link>

        <div className="mt-10 rounded-2xl border border-sky-300/40 bg-white/10 backdrop-blur-sm p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-white">Lanseras inom kort</h1>
          <p className="mt-4 text-lg text-slate-300">
            Elbilskompassen är nylanserad och vi jobbar på att kunna erbjuda personliga offerter direkt på sajten.
          </p>
          <p className="mt-4 text-slate-300">
            Under tiden — skicka ett mejl till oss så hjälper vi dig med personliga tips och rekommendationer!
          </p>
          <a
            href="mailto:hej@elbilskompassen.se?subject=Jag%20vill%20ha%20personliga%20tips"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white shadow hover:bg-emerald-700 transition"
          >
            Mejla hej@elbilskompassen.se
          </a>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white">Utforska mer</h2>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/kompassen"
              className="rounded-full bg-white/10 border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/20 transition"
            >
              Starta Elbilskompassen
            </Link>
            <Link
              href="/kalkyl"
              className="rounded-full bg-white/10 border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/20 transition"
            >
              Räkna på ekonomin
            </Link>
            <Link
              href="/modeller"
              className="rounded-full bg-white/10 border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/20 transition"
            >
              Se alla modeller
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
