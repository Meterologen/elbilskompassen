import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elbilspremie 2026 – Kolla om du har rätt till stödet",
  description:
    "Kolla om du kvalificerar för den nya elbilspremien 2026. Upp till 50 000 kr i stöd för hushåll i landsbygdskommuner. Svara på fem frågor och få svar direkt.",
  alternates: { canonical: "https://elbilskompassen.se/elbilspremie" },
};

export default function ElbilspremieLayout({ children }: { children: React.ReactNode }) {
  return children;
}
