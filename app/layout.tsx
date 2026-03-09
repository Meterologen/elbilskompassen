import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import ChatWidget from "./components/ChatWidget";
import MobileNav from "./components/MobileNav";
import GoogleAnalytics from "./components/GoogleAnalytics";
import CookieConsent from "./components/CookieConsent";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elbilskompassen – Våga välja elbil",
  description: "Funderat på elbil men inte vågat? Elbilskompassen hjälper dig hitta rätt bil, räkna på ekonomin och ta nästa steg – utan säljtryck.",
};

const bgStyle = {
  background: `
    radial-gradient(ellipse 120% 80% at 30% 15%, rgba(56, 189, 248, 0.08) 0%, transparent 45%),
    radial-gradient(ellipse 100% 70% at 70% 5%, rgba(255, 255, 255, 0.04) 0%, transparent 40%),
    linear-gradient(180deg, #0c4a6e 0%, #0f172a 15%, #1e3a5f 35%, #1e40af 60%, #2563eb 80%, #3b82f6 100%)
  `,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased text-slate-100`}>
        <a href="#main-content" className="sr-only sr-only-focusable">Hoppa till innehåll</a>
        <div className="fixed inset-0 -z-10" style={bgStyle} aria-hidden />

        <header className="sticky top-0 z-10 border-b border-sky-200/60 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 rounded-md outline-none ring-sky-400 focus-visible:ring-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {/* Compass circle */}
                  <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" opacity="0.5" />
                  {/* Lightning bolt shaped as compass needle pointing north */}
                  <path d="M13.5 3.5 L10 11.5 L13 11.5 L10.5 20.5 L14 12.5 L11 12.5 Z" fill="white" />
                  {/* Small compass ticks */}
                  <circle cx="12" cy="2.5" r="0.8" fill="white" />
                  <circle cx="12" cy="21.5" r="0.8" fill="white" opacity="0.4" />
                  <circle cx="2.5" cy="12" r="0.8" fill="white" opacity="0.4" />
                  <circle cx="21.5" cy="12" r="0.8" fill="white" opacity="0.4" />
                </svg>
              </span>
              <span className="font-semibold text-slate-900">Elbilskompassen</span>
            </Link>
            <MobileNav />
          </div>
        </header>

        <GoogleAnalytics />
        {children}
        <ChatWidget />

        <footer className="border-t border-sky-200/60 bg-white/80 py-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" opacity="0.5" />
                  <path d="M13.5 3.5 L10 11.5 L13 11.5 L10.5 20.5 L14 12.5 L11 12.5 Z" fill="white" />
                </svg>
              </span>
              <span className="font-semibold text-slate-900">Elbilskompassen</span>
            </div>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/varfor-elbil" className="hover:text-sky-600">Varför elbil?</Link>
              <Link href="/leasing" className="hover:text-sky-600">Leasing</Link>
              <Link href="/myter" className="hover:text-sky-600">Myter</Link>
              <Link href="/berattelser" className="hover:text-sky-600">Berättelser</Link>
              <Link href="/laddning" className="hover:text-sky-600">Laddning</Link>
            </nav>
            <p className="text-center text-sm text-slate-600 sm:text-left">
              Vi säljer ingenting – vi hjälper dig våga ta steget
            </p>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
