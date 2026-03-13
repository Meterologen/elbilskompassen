import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://elbilskompassen.se";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/kompassen`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/kalkyl`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/modeller`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/leasing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/elbilspremie`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/varfor-elbil`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/laddning`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/aktuellt`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/berattelser`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/om-oss`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
