import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/agenda_google?fields=code_integration&filter[status][_eq]=published&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
        },
      }
    );

    if (!res.ok) throw new Error("Échec de récupération de l'agenda");

    const { data } = await res.json();
    return NextResponse.json(data?.[0] || {});
  } catch (error) {
    console.error("Erreur API Agenda :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}