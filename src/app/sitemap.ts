import { type MetadataRoute } from "next";
import { getServiceSlugs } from "@/lib/directus";

const BASE = "https://terrasigne.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/rendez-vous`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const serviceSlugs = await getServiceSlugs().catch(() => []);
  const servicePages: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/articles?fields=id,date_updated&filter[status][_eq]=published&limit=-1`,
      {
        headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
        next: { revalidate: 3600, tags: ["articles"] },
      }
    );

    if (res.ok) {
      const { data } = await res.json();
      articlePages = (data || []).map(
        (article: { id: string; date_updated?: string }) => ({
          url: `${BASE}/blog/${article.id}`,
          lastModified: article.date_updated
            ? new Date(article.date_updated)
            : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        })
      );
    }
  } catch (error) {
    console.error("Sitemap : échec de récupération des articles", error);
  }

  return [...routes, ...servicePages, ...articlePages];
}
