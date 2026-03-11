"use client";

import Link from "next/link";
import { useState } from "react";
import { FAQS, CATEGORY_META, FILTER_OPTIONS } from "../lib/faq-data";
import type { FaqCategory, FaqItem } from "../lib/faq-data";

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

                {/* Laddning guide link */}
                {cat.value === "laddning" && (
                  <div className="mt-3 rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500/15 to-emerald-500/15 p-5">
                    <p className="text-sm text-slate-200">Vill du veta mer om kostnader, laddboxar och snabbladdning?</p>
                    <Link
                      href="/laddning"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400 transition"
                    >
                      Läs vår laddningsguide
                    </Link>
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
