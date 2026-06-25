import type { Metadata } from "next";

const API = process.env.NEXT_PUBLIC_DIRECTUS_API;
const TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/items/articles/${id}?fields=titre,contenu,photo_couverture.filename_disk`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: 3600 },
    });
    const { data } = await res.json();
    if (!data) return { title: "Article introuvable | Terrasigne" };

    const description = data.contenu?.replace(/<[^>]+>/g, "").slice(0, 160) || data.titre;
    const image = data.photo_couverture?.filename_disk
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_STORAGE}/uploads/${data.photo_couverture.filename_disk}`
      : "https://terrasigne.fr/images/hero_blog.jpg";

    return {
      title: data.titre,
      description,
      openGraph: {
        title: data.titre,
        description,
        type: "article",
        url: `https://terrasigne.fr/blog/${id}`,
        images: [{ url: image, width: 1200, height: 630, alt: data.titre }],
      },
      twitter: {
        card: "summary_large_image",
        title: data.titre,
        description,
        images: [image],
      },
      robots: { index: true, follow: true },
      alternates: { canonical: `https://terrasigne.fr/blog/${id}` },
    };
  } catch {
    return { title: "Article | Terrasigne" };
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API}/items/articles?fields=id&filter[status][_eq]=published&limit=100`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const { data } = await res.json();
    return (data || []).map((article: { id: string }) => ({ id: String(article.id) }));
  } catch {
    return [];
  }
}
