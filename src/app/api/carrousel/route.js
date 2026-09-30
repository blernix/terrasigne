import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/carrousel?fields=id,images.id,images.filename_disk,images.title`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`❌ Erreur API: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data.data);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des images du carrousel :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}