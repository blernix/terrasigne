import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("✅ API /api/services appelée !");

  try {
    console.log("🔑 Token utilisé :", process.env.NEXT_PUBLIC_DIRECTUS_TOKEN);
    console.log("🌍 URL API Directus :", process.env.NEXT_PUBLIC_DIRECTUS_API);

    const url = new URL(req.url);
    const featured = url.searchParams.get("featured") === "true";

    console.log("🔎 Paramètres API - Mis en avant :", featured);

    let filterQuery = "&filter[status][_eq]=published";

    if (featured) {
      filterQuery += `&filter[accueil][_eq]=true`;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/services?fields=id,titre,description,prix,rendez_vous,categorie_id.titre,categorie_id.description,status${filterQuery}`,
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

    console.log("📦 Données détaillées récupérées :", JSON.stringify(data.data, null, 2));

    data.data.forEach(service => {
      if (!service.categorie_id || !service.categorie_id.titre) {
        console.warn(`🚨 Attention : Le service "${service.titre}" n'a pas de catégorie valide !`, service);
      }
    });

    return NextResponse.json(data.data);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des services :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}