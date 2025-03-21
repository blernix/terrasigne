import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/articles/${id}?fields=id,titre,contenu,categorie_id.titre,date_created,photo_couverture,status`,
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

    if (data.data.status !== "published") {
      return NextResponse.json(
        { message: "Cet article n'est pas encore disponible." },
        { status: 200 }
      );
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'article :", error);
    return NextResponse.json({ message: "Article introuvable" }, { status: 404 });
  }
}