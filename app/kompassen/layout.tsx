import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vilken elbil passar dig? Gör testet",
  description:
    "Svara på 10 frågor och få en personlig elbilsrekommendation. Gratis, oberoende och utan säljtryck.",
  alternates: { canonical: "https://elbilskompassen.se/kompassen" },
};

export default function KompassenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
