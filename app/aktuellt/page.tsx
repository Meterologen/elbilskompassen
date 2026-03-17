import type { Metadata } from "next";
import Link from "next/link";
import newsData from "../../data/news.json";

export const metadata: Metadata = {
  title: "Aktuellt – Dagliga elbilsnyheter",
  description:
    "Daglig sammanfattning av de viktigaste elbilsnyheterna från svenska medier. Håll dig uppdaterad om elbilar, laddinfrastruktur och elektrifiering.",
  alternates: { canonical: "https://elbilskompassen.se/aktuellt" },
};

interface NewsSource {
  title: string;
  url: string;
  source: string;
}

interface NewsPost {
  date: string;
  title: string;
  summary: string;
  sources: NewsSource[];
  generatedAt: string;
}

const news: NewsPost[] = newsData as NewsPost[];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AktuelltPage() {
  return (
    <main id="main-content" className="min-h-screen" role="main">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="text-sm text-sky-300 hover:text-sky-200 hover:underline"
        >
          &larr; Startsida
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
          Aktuellt
        </h1>
        <p className="mt-2 text-lg text-slate-200">
          Daglig sammanfattning av elbilsnyheter från svenska medier.
        </p>

        {news.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-sky-300/40 bg-white/10 backdrop-blur-sm p-8 text-center">
            <p className="text-lg font-medium text-slate-200">
              Inga nyheter just nu
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Nyhetssammanfattningar publiceras dagligen. Kom tillbaka snart!
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {news.map((post) => (
              <article
                key={post.date}
                className="overflow-hidden rounded-2xl border border-sky-300/40 bg-white/10 backdrop-blur-sm"
              >
                <div className="border-b border-white/10 bg-white/5 px-6 py-4">
                  <time
                    dateTime={post.date}
                    className="text-sm font-medium text-slate-400"
                  >
                    {formatDate(post.date)}
                  </time>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    {post.title}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                    {post.summary.split("\n\n").map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>

                  {post.sources.length > 0 && (
                    <div className="mt-6 border-t border-white/10 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Källor
                      </p>
                      <ul className="mt-2 space-y-1">
                        {post.sources.map((src, i) => (
                          <li key={i}>
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-sky-400 hover:text-sky-300 hover:underline"
                            >
                              {src.title}
                              <span className="ml-1 text-slate-400">
                                ({src.source})
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Vill du veta vilken elbil som passar dig?
          </h2>
          <p className="mt-2 text-emerald-100">
            Svara på 10 frågor &ndash; vi matchar dig med rätt bil.
          </p>
          <Link
            href="/kompassen"
            className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-emerald-700 shadow hover:bg-emerald-50"
          >
            Starta Elbilskompassen
          </Link>
        </div>
      </div>
    </main>
  );
}
