import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Espace praticienne : jamais indexé, jamais suivi.
      disallow: ["/praticienne", "/praticienne/"],
    },
    sitemap: "https://terrasigne.fr/sitemap.xml",
  };
}
