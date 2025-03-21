import { NextResponse } from "next/server";

export async function GET() {
  console.log("📂 Requête API - Catégories d'articles");

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/categories_articles?fields=id,titre`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`❌ Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log("📦 Catégories récupérées :", JSON.stringify(data, null, 2));

    return NextResponse.json(data.data);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des catégories :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}