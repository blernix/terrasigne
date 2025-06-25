import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/articles/${id}?fields=id,titre,contenu,categorie_id.titre,date_created,photo_couverture.filename_disk,status`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`❌ Erreur API: ${response.status}`);
    }

    const { data } = await response.json();

    if (data.status !== "published") {
      return NextResponse.json(
        { message: "Cet article n'est pas encore disponible." },
        { status: 200 }
      );
    }

    const formatted = {
      id: data.id,
      titre: data.titre,
      contenu: data.contenu,
      categorie: data.categorie_id?.titre || "Sans catégorie",
      date_created: data.date_created,
      couverture: data.photo_couverture?.filename_disk
        ? `${process.env.NEXT_PUBLIC_DIRECTUS_STORAGE}/uploads/${data.photo_couverture.filename_disk}`
        : undefined,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'article :", error);
    return NextResponse.json({ message: "Article introuvable" }, { status: 404 });
  }
}