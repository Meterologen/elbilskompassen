import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privatleasing elbil – Jämför erbjudanden",
  description:
    "Jämför privatleasing av elbil. Se månadskostnad, bindningstid och villkor för populära elbilar i Sverige.",
  alternates: { canonical: "https://elbilskompassen.se/leasing" },
};

export default function LeasingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
