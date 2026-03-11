import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Om Elbilskompassen – Oberoende elbilsguide",
  description:
    "Elbilskompassen är en oberoende guide som hjälper dig välja rätt elbil. Ingen försäljning, bara ärlig information.",
  alternates: { canonical: "https://elbilskompassen.se/om-oss" },
};

export default function OmOssLayout({ children }: { children: React.ReactNode }) {
  return children;
}
