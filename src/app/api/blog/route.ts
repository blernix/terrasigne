import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("🔍 Requête API - Articles");

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get("page") || "1";
    const category = url.searchParams.get("category") || "";
    const search = url.searchParams.get("search") || "";
    const featured = url.searchParams.get("featured") === "true";

    console.log("🔎 Paramètres API - Page :", page, "Catégorie :", category, "Recherche :", search, "Mis en avant :", featured);

    let filterQuery = "&filter[status][_eq]=published";

    if (featured) {
      filterQuery += `&filter[accueil][_eq]=true`;
    }

    if (category) {
      filterQuery += `&filter[categorie_id][_eq]=${category}`;
    }

    if (search) {
      filterQuery += `&filter[titre][_contains]=${search}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/articles?fields=id,titre,contenu,date_created,categorie_id.titre,photo_couverture.filename_disk&limit=10&page=${page}${filterQuery}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`❌ Erreur API: ${response.status}`);
    }

    const data = await response.json();

    const formattedArticles = data.data.map((article: any) => ({
      id: article.id,
      titre: article.titre,
      contenu: article.contenu,
      date_created: article.date_created, // pas besoin de la formater ici, tu le fais dans le composant
      categorie: article.categorie_id?.titre || "Sans catégorie",
      couverture: article.photo_couverture?.filename_disk
        ? `${process.env.NEXT_PUBLIC_DIRECTUS_STORAGE}/uploads/${article.photo_couverture.filename_disk}`
        : "/images/default-cover.jpg",
    }));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des articles :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}