import type { MetadataRoute } from "next";
import { EV_MODELS } from "./lib/cars";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://elbilskompassen.se";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: "2026-03-17", changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/kompassen`, lastModified: "2026-03-09", changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/kalkyl`, lastModified: "2026-03-17", changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/modeller`, lastModified: "2026-03-09", changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/leasing`, lastModified: "2026-03-17", changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: "2026-03-09", changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/elbilspremie`, lastModified: "2026-03-17", changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/varfor-elbil`, lastModified: "2026-03-09", changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/laddning`, lastModified: "2026-03-09", changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/aktuellt`, lastModified: "2026-03-17", changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/berattelser`, lastModified: "2026-03-09", changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/om-oss`, lastModified: "2026-02-01", changeFrequency: "yearly", priority: 0.3 },
  ];

  const modelPages: MetadataRoute.Sitemap = EV_MODELS.map((car) => ({
    url: `${base}/modeller/${car.id}`,
    lastModified: "2026-03-17",
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...modelPages];
}
