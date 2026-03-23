import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  EV_MODELS,
  getModelById,
  formatSek,
  brandFlag,
  brandCountryName,
  SIZE_LABEL,
  type EvModel,
  type CarSize,
} from "../../lib/cars";
import { findAllLeasingForCar, type LeasingOffer } from "../../lib/leasing";

// ── Static generation ───────────────────────────────────────────────────────
export function generateStaticParams() {
  return EV_MODELS.map((car) => ({ slug: car.id }));
}

// ── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const car = getModelById(slug);
  if (!car) return {};

  const name = `${car.brand} ${car.model}`;
  const leasing = findAllLeasingForCar(car);
  const leasingText =
    leasing.length > 0
      ? `, privatleasing fran ${fmtSek(leasing[0].monthlyPrice)} kr/man`
      : "";

  return {
    title: `${name} – Pris, rackvidd & specifikationer`,
    description: `${name} kostar fran ${formatSek(car.priceSek)}, har ${car.rangeKm} km rackvidd och ${car.batteryKwh} kWh batteri. Se specifikationer${leasingText} och jamfor.`,
    alternates: {
      canonical: `https://elbilskompassen.se/modeller/${car.id}`,
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtSek(n: number) {
  return new Intl.NumberFormat("sv-SE").format(n);
}

function generateSummary(car: EvModel): string {
  const name = `${car.brand} ${car.model}`;
  const sizeLabel = SIZE_LABEL[car.size];

  // Average price per segment
  const segmentCars = EV_MODELS.filter((c) => c.size === car.size);
  const avgPrice = Math.round(
    segmentCars.reduce((s, c) => s + c.priceSek, 0) / segmentCars.length
  );
  const priceDiff = car.priceSek - avgPrice;
  const priceComment =
    Math.abs(priceDiff) < 30_000
      ? `ligger prismassigt i mitten av segmentet ${sizeLabel}`
      : priceDiff < 0
        ? `ar ett prisvardeforbival i segmentet ${sizeLabel} – ${formatSek(Math.abs(priceDiff))} under snittet`
        : `ligger ${formatSek(priceDiff)} over snittpriset i segmentet ${sizeLabel}`;

  // Range context
  const dailyKm = Math.round(car.rangeKm * 0.8); // 80% of WLTP
  const dailyMiles = Math.round(dailyKm / 10);
  const rangeComment = `Med ${car.rangeKm} km WLTP-rackvidd racker batteriet for cirka ${dailyMiles} mils vardagspendling under realistiska forhallanden`;

  // Charge comment
  const chargeComment =
    car.fastChargeMin <= 20
      ? `Snabbladdning till 80 % pa bara ${car.fastChargeMin} minuter gor den till en av de snabbaste i klassen`
      : car.fastChargeMin <= 30
        ? `Snabbladdning till 80 % tar ${car.fastChargeMin} minuter`
        : `Snabbladdning till 80 % tar ${car.fastChargeMin} minuter, vilket ar godkant for langre resor`;

  // Practical features
  const features: string[] = [];
  if (car.trunkLiters >= 500) features.push(`rymligt bagageutrymme pa ${car.trunkLiters} liter`);
  if (car.seats >= 7) features.push(`${car.seats} sittplatser`);
  if (car.towbar) features.push("dragkrok");
  if (car.awd) features.push("fyrhjulsdrift");

  const practicalComment =
    features.length > 0
      ? `Bilen erbjuder ${features.join(", ")}.`
      : "";

  return `${name} ${priceComment}. ${rangeComment}. ${chargeComment}. ${practicalComment}`.trim();
}

function getSimilarCars(car: EvModel): EvModel[] {
  const priceRange = car.priceSek * 0.3;
  return EV_MODELS.filter(
    (c) =>
      c.id !== car.id &&
      c.size === car.size &&
      Math.abs(c.priceSek - car.priceSek) <= priceRange
  )
    .sort((a, b) => Math.abs(a.priceSek - car.priceSek) - Math.abs(b.priceSek - car.priceSek))
    .slice(0, 3);
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function ModelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const car = getModelById(slug);
  if (!car) notFound();

  const name = `${car.brand} ${car.model}`;
  const flag = brandFlag(car.brand);
  const countryName = brandCountryName(car.brand);
  const leasing = findAllLeasingForCar(car);
  const similar = getSimilarCars(car);
  const summary = generateSummary(car);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Startsida", item: "https://elbilskompassen.se" },
        { "@type": "ListItem", position: 2, name: "Elbilar", item: "https://elbilskompassen.se/modeller" },
        { "@type": "ListItem", position: 3, name: name, item: `https://elbilskompassen.se/modeller/${car.id}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description: summary,
      brand: { "@type": "Brand", name: car.brand },
      offers: {
        "@type": "Offer",
        priceCurrency: "SEK",
        price: car.priceSek,
        availability: "https://schema.org/InStock",
      },
    },
  ];

  return (
    <main id="main-content" className="min-h-screen" role="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="text-sky-300 hover:text-sky-200 hover:underline">Startsida</Link>
            </li>
            <li aria-hidden="true" className="mx-1">/</li>
            <li>
              <Link href="/modeller" className="text-sky-300 hover:text-sky-200 hover:underline">Elbilar</Link>
            </li>
            <li aria-hidden="true" className="mx-1">/</li>
            <li className="text-slate-200">{name}</li>
          </ol>
        </nav>

        {/* Heading + flag */}
        <div className="mt-6 flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{name}</h1>
          {flag && (
            <img
              src={`https://flagcdn.com/w80/${flag.toLowerCase()}.png`}
              alt={countryName}
              className="h-8 w-auto rounded-sm shadow-sm"
            />
          )}
        </div>
        <p className="mt-1 text-sm text-slate-400">{SIZE_LABEL[car.size]} – {car.year}</p>

        {/* Spec table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-sky-300/30 bg-white/10 backdrop-blur-sm">
          <h2 className="sr-only">Specifikationer</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4">
            <SpecCell label="Pris" value={formatSek(car.priceSek)} />
            <SpecCell label="Rackvidd" value={`${car.rangeKm} km`} />
            <SpecCell label="Batteri" value={`${car.batteryKwh} kWh`} />
            <SpecCell label="Snabbladdning" value={`${car.fastChargeMin} min`} />
            <SpecCell label="Bagageutrymme" value={`${car.trunkLiters} L`} />
            <SpecCell label="Sittplatser" value={`${car.seats} st`} />
            <SpecCell label="Drivning" value={car.awd ? "Fyrhjulsdrift" : "Tvåhjulsdrift"} />
            <SpecCell label="Dragkrok" value={car.towbar ? "Ja" : "Nej"} />
          </div>
        </div>

        {/* Summary */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Om {name}</h2>
          <p className="mt-3 leading-relaxed text-slate-200">{summary}</p>
        </section>

        {/* Leasing section */}
        {leasing.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-white">
              Privatleasing – {car.brand}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {leasing.length} erbjudande{leasing.length > 1 ? "n" : ""} fran{" "}
              {car.brand}
            </p>
            <div className="mt-4 space-y-4">
              {leasing.map((o) => (
                <LeasingCard key={o.id} offer={o} />
              ))}
            </div>
            <p className="mt-4">
              <Link
                href={`/leasing?brand=${encodeURIComponent(car.brand)}`}
                className="text-sm text-sky-300 hover:text-sky-200 hover:underline"
              >
                Se alla leasingerbjudanden fran {car.brand} →
              </Link>
            </p>
          </section>
        )}

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/kalkyl?evPrice=${car.priceSek}&evModel=${encodeURIComponent(name)}&evKwhPerMile=${car.kwhPerMile}`}
            className="rounded-full bg-sky-600 px-6 py-3 text-center font-medium text-white shadow-md hover:bg-sky-500 transition"
          >
            Rakna pa {car.model}
          </Link>
          <Link
            href="/modeller"
            className="rounded-full border border-sky-300/50 bg-white/10 px-6 py-3 text-center font-medium text-slate-200 hover:bg-white/20 transition"
          >
            Jamfor alla elbilar
          </Link>
        </div>

        {/* Similar cars */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-white">Liknande bilar</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {similar.map((c) => (
                <Link
                  key={c.id}
                  href={`/modeller/${c.id}`}
                  className="group rounded-2xl border border-sky-300/30 bg-white/10 p-5 backdrop-blur-sm transition hover:border-sky-300/60 hover:bg-white/15"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        {c.brand}
                      </p>
                      <p className="font-bold text-white">{c.brand} {c.model}</p>
                    </div>
                    {brandFlag(c.brand) && (
                      <img
                        src={`https://flagcdn.com/w40/${brandFlag(c.brand).toLowerCase()}.png`}
                        alt={brandCountryName(c.brand)}
                        className="h-5 w-auto rounded-sm"
                      />
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-[11px] text-slate-400">Pris</p>
                      <p className="font-semibold text-slate-200">{formatSek(c.priceSek)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">Rackvidd</p>
                      <p className="font-semibold text-slate-200">{c.rangeKm} km</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function SpecCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-white/10 px-4 py-3 last:border-r-0 [&:nth-child(2)]:border-r-0 sm:[&:nth-child(2)]:border-r [&:nth-child(4)]:border-r-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-200">{value}</p>
    </div>
  );
}

function LeasingCard({ offer: o }: { offer: LeasingOffer }) {
  return (
    <div className="rounded-xl border border-sky-300/20 bg-white/5 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-semibold text-white">
            {o.brand} {o.model} {o.trim}
          </p>
          <p className="text-sm text-slate-400">
            {o.contractMonths} man · {fmtSek(o.annualMileage)} mil/ar
            {o.downPayment > 0 && ` · ${fmtSek(o.downPayment)} kr insats`}
          </p>
        </div>
        <p className="text-lg font-bold text-emerald-400">
          {fmtSek(o.monthlyPrice)} kr/man
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {o.serviceIncluded && (
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            Service ingar
          </span>
        )}
        {o.insuranceIncluded && (
          <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-medium text-sky-300">
            Forsakring ingar
          </span>
        )}
        {o.winterTiresIncluded && (
          <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
            Vinterdack ingar
          </span>
        )}
      </div>
      {o.note && <p className="mt-2 text-xs text-slate-400">{o.note}</p>}
      <a
        href={o.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs text-sky-300 hover:text-sky-200 hover:underline"
      >
        {o.source} →
      </a>
    </div>
  );
}
