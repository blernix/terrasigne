import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, consentement } = await req.json();
    const userCreated = process.env.NEXT_PUBLIC_DIRECTUS_CLIENT_ID;

    console.log("🔍 Valeurs reçues :", { email, consentement, userCreated });

    if (!email) {
      return NextResponse.json({ message: "Email requis." }, { status: 400 });
    }

    // 🔍 Vérifier si l'email existe déjà
    const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/abonnes?filter[email][_eq]=${email}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
      },
    });

    const checkData = await checkResponse.json();
    if (checkData.data.length > 0) {
      console.log("🚫 Email déjà inscrit :", email);
      return NextResponse.json({ message: "Cet email est déjà inscrit à la newsletter." }, { status: 409 });
    }

    // ✅ Nouvelle insertion AVEC valeurs forcées (y compris `consentement`)
    const payload = {
      email,
      consentement: consentement === true ? 1 : 0, // SQLite stocke les booléens en tant que `0` ou `1`
      user_created: userCreated ?? null,
      date_created: new Date().toISOString(), // Ajoute toujours la date
    };

    console.log("📤 Envoi des données à Directus :", JSON.stringify(payload, null, 2));

    const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_API}/items/abonnes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_DIRECTUS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("🔴 Réponse complète de Directus :", JSON.stringify(data, null, 2));
      throw new Error(data.errors?.[0]?.message || "Erreur lors de l'inscription.");
    }

    console.log("✅ Abonné ajouté avec succès :", data);
    return NextResponse.json({ message: "Inscription réussie !" }, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur API abonnement :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}