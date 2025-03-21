import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("🔍 Requête API - Articles");

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get("page") || "1";
    const category = url.searchParams.get("category") || "";
    const search = url.searchParams.get("search") || "";
    const featured = url.searchParams.get("featured") === "true"; // Filtre pour les articles en vedette

    console.log("🔎 Paramètres API - Page :", page, "Catégorie :", category, "Recherche :", search, "Mis en avant :", featured);

    let filterQuery = "&filter[status][_eq]=published"; // 🔥 Ne récupérer que les articles publiés

    if (featured) {
      filterQuery += `&filter[accueil][_eq]=true`; // 🔥 Récupérer uniquement les articles mis en avant
    }

    if (category) {
      filterQuery += `&filter[categorie_id][_eq]=${category}`;
    }

    if (search) {
      filterQuery += `&filter[titre][_contains]=${search}`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/articles?fields=id,titre,contenu,categorie_id.titre,date_created,photo_couverture${filterQuery}&limit=10&page=${page}`,
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

    // 🛠️ Transformation des données pour le front
    const formattedArticles = data.data.map(article => ({
      id: article.id,
      titre: article.titre,
      contenu: article.contenu,
      categorie: article.categorie_id?.nom || "Sans catégorie",
      date: new Date(article.date_created).toLocaleDateString("fr-FR"),
      couverture: article.couverture
        ? `${process.env.NEXT_PUBLIC_DIRECTUS_API}/assets/${article.couverture}`
        : "/images/default-cover.jpg",
    }));

    console.log("📦 Articles formatés :", JSON.stringify(formattedArticles, null, 2));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des articles :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}