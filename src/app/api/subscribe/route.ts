import { NextResponse } from "next/server";
import { sendNewsletterConfirmation } from "@/lib/newsletter";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, consentement } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim() : "";

    if (!email) {
      return NextResponse.json({ message: "Email requis." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Adresse email invalide." },
        { status: 400 }
      );
    }

    if (consentement !== true) {
      return NextResponse.json(
        { message: "Consentement requis." },
        { status: 400 }
      );
    }

    const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
    if (!listId) {
      return NextResponse.json(
        { message: "Liste newsletter non configurée." },
        { status: 500 }
      );
    }

    await sendNewsletterConfirmation(email, [listId]);

    return NextResponse.json(
      { message: "Un email de confirmation vient de vous être envoyé." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur API abonnement :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
