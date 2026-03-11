import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elbilar i Sverige – Jämför 54 modeller",
  description:
    "Utforska 54 elbilar med filter, sortering och detaljerad information. Hitta elbilen som passar dig.",
  alternates: { canonical: "https://elbilskompassen.se/modeller" },
};

export default function ModellerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
