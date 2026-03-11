import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elbilskalkyl – Jämför kostnad elbil vs bensinbil",
  description:
    "Räkna ut vad du sparar med elbil. Jämför totalkostnad för elbil och bensinbil med dina egna siffror.",
  alternates: { canonical: "https://elbilskompassen.se/kalkyl" },
};

export default function KalkylLayout({ children }: { children: React.ReactNode }) {
  return children;
}
