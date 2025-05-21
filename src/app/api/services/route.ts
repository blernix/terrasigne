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
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/services?fields=id,titre,description,prix,rendez_vous,categorie_id.titre,categorie_id.description,categorie_id.couverture.filename_disk,status${filterQuery}`,
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

    const formattedServices = data.data.map((service: any) => ({
      id: service.id,
      titre: service.titre,
      description: service.description,
      prix: service.prix,
      rendez_vous: service.rendez_vous,
      status: service.status,
      categorie: {
        titre: service.categorie_id?.titre || "Sans catégorie",
        description: service.categorie_id?.description || "",
        couverture: service.categorie_id?.couverture?.filename_disk
          ? `${process.env.NEXT_PUBLIC_DIRECTUS_STORAGE}/uploads/${service.categorie_id.couverture.filename_disk}`
          : "/images/default-cover.jpg",
      },
    }));

    console.log("📦 Services formatés :", JSON.stringify(formattedServices, null, 2));

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des services :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}