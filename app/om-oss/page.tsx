"use client";

import Link from "next/link";
import { useState } from "react";

export default function OmOssPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Feedback via Elbilskompassen");
    const body = encodeURIComponent(`Från: ${name}${email ? ` (${email})` : ""}\n\n${message}`);
    window.location.href = `mailto:hej@elbilskompassen.se?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">← Startsida</Link>

        {/* Hero */}
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Om Elbilskompassen</h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-200">
          Vi startade Elbilskompassen med ett enda mål: att göra det enklare för dig som funderar på elbil att våga ta steget.
        </p>

        {/* Vår mission */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">Vår mission</h2>
          <div className="mt-4 rounded-2xl border border-sky-300/30 bg-white/5 p-6 space-y-4">
            <p className="text-slate-200 leading-relaxed">
              Att köpa sin första elbil kan kännas överväldigande. Räckvidd, laddning, batterihälsa, ekonomi – frågorna är många och informationen spretig. Vi vet, för vi har varit där själva.
            </p>
            <p className="text-slate-200 leading-relaxed">
              Därför byggde vi Elbilskompassen: en oberoende guide som samlar allt du behöver veta på ett ställe. Inga dolda agendor, inget säljtryck. Bara ärlig och lättillgänglig information som hjälper dig fatta ett tryggt beslut.
            </p>
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-400/30 p-5">
              <p className="text-lg font-semibold text-emerald-300">
                Det är enklare och billigare än du tror.
              </p>
              <p className="mt-2 text-slate-300">
                De flesta som byter till elbil önskar att de hade gjort det tidigare. Vi vill att fler ska våga – och vi finns här för att hjälpa dig hela vägen.
              </p>
            </div>
          </div>
        </section>

        {/* Vad vi erbjuder */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">Vad vi erbjuder</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { icon: "🧭", title: "Elbilskompassen", desc: "Personlig matchning – svara på 10 frågor och få reda på vilken elbil som passar just dig." },
              { icon: "📊", title: "Kostnadskalkyl", desc: "Jämför totalkostnad mellan elbil och bensinbil med dina egna siffror." },
              { icon: "🚗", title: "Modellguide", desc: "Utforska 50+ elbilar med filter, sortering och detaljerad information." },
              { icon: "💡", title: "Kunskapsbank", desc: "Myter, laddningsguider, berättelser från riktiga elbilsägare och mer." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-sky-300/30 bg-white/5 p-5">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vilka vi är */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">Vilka står bakom?</h2>
          <div className="mt-4 rounded-2xl border border-sky-300/30 bg-white/5 p-6">
            <p className="text-slate-200 leading-relaxed">
              Elbilskompassen drivs av teknik- och miljöintresserade personer som tror på en elektrisk framtid.
              Vi är inte bundna till något bilmärke, ingen återförsäljare och ingen leasingfirma. Det gör att vi kan ge dig en ärlig bild – utan vinklingar.
            </p>
          </div>
        </section>

        {/* Kontakt */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">Kontakt</h2>
          <div className="mt-4 rounded-2xl border border-sky-300/30 bg-white/5 p-6 space-y-3">
            <p className="text-slate-200">
              Har du frågor, vill samarbeta eller bara vill säga hej? Hör av dig!
            </p>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <a href="mailto:hej@elbilskompassen.se" className="font-medium text-sky-300 hover:text-sky-200 hover:underline">
                hej@elbilskompassen.se
              </a>
            </div>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              <span className="text-slate-300">elbilskompassen.se</span>
            </div>
          </div>
        </section>

        {/* Feedback-formulär */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-white">Skicka feedback</h2>
          <p className="mt-2 text-slate-300">
            Vi vill bli bättre! Har du förslag, hittat ett fel eller saknar något? Berätta för oss.
          </p>

          {sent ? (
            <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-6 text-center">
              <p className="text-lg font-semibold text-emerald-300">Tack för din feedback!</p>
              <p className="mt-2 text-slate-300">Ditt e-postprogram borde ha öppnats med meddelandet. Skicka iväg det så hör vi av oss.</p>
              <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm text-sky-300 hover:text-sky-200 hover:underline">
                Skicka mer feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-sky-300/30 bg-white/5 p-6 space-y-4">
              <div>
                <label htmlFor="feedback-name" className="block text-sm font-medium text-slate-300">Namn</label>
                <input
                  id="feedback-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sky-300/30 bg-white/10 px-4 py-2.5 text-white placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  placeholder="Ditt namn"
                />
              </div>
              <div>
                <label htmlFor="feedback-email" className="block text-sm font-medium text-slate-300">E-post <span className="text-slate-500">(valfritt)</span></label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sky-300/30 bg-white/10 px-4 py-2.5 text-white placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  placeholder="din@epost.se"
                />
              </div>
              <div>
                <label htmlFor="feedback-message" className="block text-sm font-medium text-slate-300">Meddelande</label>
                <textarea
                  id="feedback-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-sky-300/30 bg-white/10 px-4 py-2.5 text-white placeholder-slate-400 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 resize-none"
                  placeholder="Berätta vad du tycker, vad som kan bli bättre eller vad du saknar..."
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-emerald-500 px-6 py-2.5 font-semibold text-white shadow hover:bg-emerald-400 transition"
              >
                Skicka feedback
              </button>
            </form>
          )}
        </section>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Redo att utforska?</h2>
          <p className="mt-2 text-emerald-100">Börja med Elbilskompassen eller jämför modeller direkt.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/kompassen" className="rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">
              Starta Elbilskompassen
            </Link>
            <Link href="/modeller" className="rounded-full border-2 border-white/80 px-8 py-3 font-semibold text-white hover:bg-white/10">
              Utforska modeller
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
