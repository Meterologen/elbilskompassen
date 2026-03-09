"use client";

import Link from "next/link";
import { useState } from "react";

// ── Data ────────────────────────────────────────────────────────────────────────

type FaqCategory = "myter" | "ekonomi" | "laddning" | "premie" | "ovrigt";

interface FaqItem {
  q: string;
  a: string;
  category: FaqCategory;
}

const CATEGORY_META: { value: FaqCategory; label: string; icon: string }[] = [
  { value: "premie", label: "Elbilspremien 2026", icon: "\uD83C\uDFF7\uFE0F" },
  { value: "myter", label: "Myter & fakta", icon: "?" },
  { value: "ekonomi", label: "Ekonomi & kostnad", icon: "$" },
  { value: "laddning", label: "Laddning", icon: "\u26A1" },
  { value: "ovrigt", label: "Övrigt", icon: "\u2139\uFE0F" },
];

const FILTER_OPTIONS: { value: FaqCategory | "all"; label: string }[] = [
  { value: "all", label: "Alla" },
  ...CATEGORY_META.map((c) => ({ value: c.value, label: c.label })),
];

const FAQS: FaqItem[] = [
  // ── Myter & fakta ──
  {
    category: "myter",
    q: "Är elbilar för dyra?",
    a: "Nypriset har sjunkit kraftigt. Räknar du in lägre driftskostnad – billigare bränsle, lägre skatt och mindre underhåll – blir totalkostnaden ofta lägre än bensin redan efter 2–3 år.",
  },
  {
    category: "myter",
    q: "Dör batteriet efter 5 år?",
    a: "Nej. De flesta tillverkare ger 8–15 års garanti på batteriet. Moderna batterier behåller 70–80 % av sin kapacitet efter 200 000 km.",
  },
  {
    category: "myter",
    q: "Finns det tillräckligt med laddstationer?",
    a: "Sverige har över 25 000 publika laddpunkter och nätverket växer snabbt. Cirka 80 % av all laddning sker hemma, så publik laddning behövs främst på längre resor.",
  },
  {
    category: "myter",
    q: "Räcker elen i Sverige om alla kör elbil?",
    a: "Ja. Om hela Sveriges bilflotta vore elektrisk skulle elanvändningen öka med cirka 10 %. Idag står elbilar för ungefär 2 % av den totala elförbrukningen.",
  },
  {
    category: "myter",
    q: "Brinner elbilar lättare?",
    a: "Nej, statistik visar lägre brandrisk per körd kilometer jämfört med fossildrivna bilar.",
  },
  {
    category: "myter",
    q: "Fungerar elbilar i kyla?",
    a: "Räckvidden kan minska 10–30 % vid kyla, men med förvärmning fungerar bilen utmärkt. Tusentals elbilsägare i Norrland kör varje vinter utan problem.",
  },
  {
    category: "myter",
    q: "Tappar elbilar allt sitt värde?",
    a: "Andrahandsvärdena förbättras stadigt. Modeller som Tesla Model 3 och Volvo EX30 håller värdet bra jämfört med fossildrivna bilar i samma klass.",
  },
  {
    category: "myter",
    q: "Borde jag inte vänta med att köpa elbil?",
    a: "Priserna sjunker, laddnätverket växer och besparingarna börjar dag 1. Ju längre du väntar, desto mer pengar betalar du i dyrare bränsle och underhåll.",
  },

  // ── Ekonomi ──
  {
    category: "ekonomi",
    q: "Vad kostar det att ladda en elbil hemma?",
    a: "Med ett genomsnittligt elpris på 1 kr/kWh kostar det cirka 20–30 kr att ladda för 20 mils räckvidd. Det kan jämföras med 150–200 kr i bensin för samma sträcka.",
  },
  {
    category: "ekonomi",
    q: "Är det billigare att leasa eller köpa?",
    a: "Det beror på din situation. Leasing ger lägre ingångskostnad och du slipper risken med andrahandsvärdet. Köp lönar sig ofta på längre sikt. Använd vår kostnadskalkyl för att jämföra.",
  },
  {
    category: "ekonomi",
    q: "Hur mycket sparar jag på underhåll?",
    a: "Elbilar har färre rörliga delar – ingen oljebyte, enklare bromsar (tack vare regenerering) och ingen avgasrening. Underhållskostnaden är ofta 30–50 % lägre.",
  },
  {
    category: "ekonomi",
    q: "Hur påverkas försäkringskostnaden?",
    a: "Försäkringen kan vara något dyrare på grund av högt nypris och dyra reservdelar, men det vägs ofta upp av lägre bränsle- och underhållskostnader.",
  },

  // ── Laddning ──
  {
    category: "laddning",
    q: "Hur lång tid tar det att ladda?",
    a: "Hemma med en wallbox (11 kW): cirka 6–8 timmar för en full laddning. Vid snabbladdare (50–350 kW): 20–40 minuter för 10–80 %. De flesta laddar över natten hemma.",
  },
  {
    category: "laddning",
    q: "Behöver jag installera en laddbox hemma?",
    a: "Det rekommenderas starkt. En wallbox ger säker och snabb laddning. Installationen kostar vanligtvis 10 000–20 000 kr inklusive arbete.",
  },
  {
    category: "laddning",
    q: "Kan jag ladda i ett vanligt vägguttag?",
    a: "Det går, men det är långsamt (ca 1 mil per timme) och rekommenderas inte som permanent lösning. Uttaget måste vara jordat och i gott skick.",
  },
  {
    category: "laddning",
    q: "Vad kostar det att snabbladda på resande fot?",
    a: "Snabbladdning kostar vanligtvis 4–7 kr/kWh beroende på operatör och effekt. En laddning från 10 till 80 % kostar ungefär 200–400 kr.",
  },

  // ── Elbilspremien ──
  {
    category: "premie",
    q: "Vad är elbilspremien?",
    a: "Elbilspremien är ett statligt stöd som ger 1 300 kr/månad i upp till tre år (totalt 46 800 kr) till hushåll som köper eller leasar en elbil. Stödet administreras av Naturvårdsverket och finansieras via EU:s sociala klimatfond.",
  },
  {
    category: "premie",
    q: "Vem kan söka elbilspremien?",
    a: "Privatpersoner vars hushållsinkomst är lägre än 80 % av medelinkomsten och som bor i en av de cirka 177 landsbygdskommuner eller 99 kommuner med begränsad kollektivtrafik som ingår. 14 storstadskommuner är helt uteslutna. Du får inte redan äga en elbil eller laddhybrid.",
  },
  {
    category: "premie",
    q: "Hur mycket kan jag få?",
    a: "Grundpremien är 1 300 kr/månad i upp till 36 månader, totalt 46 800 kr. Har hushållet en inkomst under 50 % av medelinkomsten tillkommer ett starttillägg på 18 000 kr vid första utbetalningen – totalt upp till 64 800 kr.",
  },
  {
    category: "premie",
    q: "Vilka bilar gäller premien för?",
    a: "Premien gäller rena elbilar (inga hybrider eller laddhybrider) med ett inköpspris på max 450 000 kr. Både nya och begagnade bilar omfattas, liksom köp och leasing.",
  },
  {
    category: "premie",
    q: "När kan jag ansöka?",
    a: "Elbilspremien öppnade för ansökningar den 18 mars 2026. Sista ansökningsdag är 30 juni 2029, men för ansökningar efter 30 juni 2028 kan beloppen bli lägre.",
  },
  {
    category: "premie",
    q: "Hur ansöker jag?",
    a: "Ansökan görs digitalt via Naturvårdsverkets webbplats. Besök naturvardsverket.se/elbilspremien för mer information och för att ansöka.",
  },

  // ── Övrigt ──
  {
    category: "ovrigt",
    q: "Kan jag dra husvagn med en elbil?",
    a: "Ja, allt fler elbilar har dragkrok med kapacitet upp till 1 000–2 500 kg. Tänk på att räckvidden minskar med släp. Filtrera på dragkrok i vår modellguide.",
  },
  {
    category: "ovrigt",
    q: "Hur länge håller en elbil?",
    a: "Det finns inga indikationer på att en elbil håller kortare tid än en fossilbil. Elmotorn har extremt lång livslängd och batterierna är garanterade i 8–15 år.",
  },
  {
    category: "ovrigt",
    q: "Är elbilen bra för miljön på riktigt?",
    a: "Ja. Även med hänsyn till batteritillverkning är en elbils totala klimatavtryck 50–70 % lägre än en fossilbils under hela livscykeln, särskilt i Sverige med ren el.",
  },
  {
    category: "ovrigt",
    q: "Kan jag köra långt med elbil?",
    a: "Absolut. Många moderna elbilar har 400–600 km räckvidd. Med snabbladdarnätverket tar en 15-minuterspaus dig ytterligare 15–20 mil. Stockholm–Göteborg går utan problem.",
  },
];

// ── Accordion component ─────────────────────────────────────────────────────────

function Accordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-sky-300/30 bg-white/95 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-900">{item.q}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="text-sm leading-relaxed text-slate-700">{item.a}</p>
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const [category, setCategory] = useState<FaqCategory | "all">("all");

  const filtered = category === "all" ? FAQS : FAQS.filter((f) => f.category === category);
  const visibleCategories = category === "all" ? CATEGORY_META : CATEGORY_META.filter((c) => c.value === category);

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link href="/" className="text-sm text-sky-300 hover:text-sky-200 hover:underline">← Startsida</Link>

        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Vanliga frågor</h1>
        <p className="mt-2 text-lg text-slate-200">
          Allt du undrar om elbilar – från myter och ekonomi till laddning och elbilspremien.
        </p>

        {/* Category filter */}
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                category === c.value
                  ? "bg-emerald-500 text-white shadow-md"
                  : "border border-sky-300/50 bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-400">Visar {filtered.length} frågor</p>

        {/* FAQ grouped by category */}
        <div className="mt-6 space-y-10">
          {visibleCategories.map((cat) => {
            const items = filtered.filter((f) => f.category === cat.value);
            if (items.length === 0) return null;
            return (
              <section key={cat.value}>
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <span>{cat.icon}</span> {cat.label}
                </h2>

                {/* Elbilspremien highlight */}
                {cat.value === "premie" && (
                  <div className="mt-3 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/15 to-sky-500/15 p-6">
                    <p className="text-sm leading-relaxed text-slate-200">
                      Från 18 mars 2026 kan hushåll i landsbygdskommuner och områden med begränsad kollektivtrafik söka elbilspremien.
                      Stödet ger <strong className="text-white">1 300 kr/månad i upp till 3 år</strong> (totalt 46 800 kr).
                      Hushåll med lägre inkomst kan även få ett starttillägg på 18 000 kr.
                    </p>
                    <p className="mt-3 text-sm text-slate-300">
                      Premien gäller rena elbilar med ett pris på max 450 000 kr – både nya, begagnade, köp och leasing.
                    </p>
                    <a
                      href="https://www.naturvardsverket.se/amnesomraden/klimatomstallningen/elbilspremien/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-400 transition"
                    >
                      Läs mer på Naturvårdsverket
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  {items.map((item, i) => (
                    <Accordion key={i} item={item} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Hittar du inte svaret?</h2>
          <p className="mt-2 text-emerald-100">Prova vår AI-assistent eller hör av dig direkt.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/om-oss" className="rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50">
              Kontakta oss
            </Link>
            <Link href="/kompassen" className="rounded-full border-2 border-white/80 px-8 py-3 font-semibold text-white hover:bg-white/10">
              Starta Elbilskompassen
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
