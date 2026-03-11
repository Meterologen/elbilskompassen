import type { Metadata } from "next";
import { FAQS } from "../lib/faq-data";

export const metadata: Metadata = {
  title: "Vanliga frågor om elbil – Myter, ekonomi och laddning",
  description:
    "Svar på de vanligaste frågorna om elbilar: pris, räckvidd, laddning, batterier och elbilspremien 2026.",
  alternates: { canonical: "https://elbilskompassen.se/faq" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
