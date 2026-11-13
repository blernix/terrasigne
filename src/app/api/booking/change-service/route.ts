import { NextResponse } from "next/server";
import { noterIncident } from "@/lib/incidents";
import { performServiceChange } from "@/lib/serviceChangeFlow";

const DECLARATIVE_FIELDS = ["duree", "pause", "prix"] as const;
const DECLARATIVE_MESSAGE =
  "Le corps de la requête ne peut pas imposer la durée, la pause ou le prix : ils sont lus dans la base. Envoyez seulement le jeton et la prestation choisie.";

/**
 * Changement de prestation d'un rendez-vous déjà pris, côté cliente.
 *
 * Corps accepté : `{ token, serviceId, formuleId? }` — rien d'autre. La durée,
 * la pause, le prix et le document joint sont résolus dans Directus ; les
 * champs `duree`, `pause` ou `prix` du corps sont refusés (valeurs
 * déclaratives interdites).
 *
 * Le rendez-vous est modifié sur place (même événement, même bookingToken,
 * même début), après contrôle de la plage ouverte, du chevauchement et du
 * délai de 48 h. Un échec d'email après un patch réussi renvoie 200 +
 * `warning`, jamais 502.
 */
export async function POST(req: Request) {
  try {
    // Préprod : refus AVANT toute lecture (corps, Directus, agenda).
    if (process.env.PREPROD_MODE === "1") {
      return NextResponse.json(
        { message: "Modification désactivée sur la préprod." },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      body = null;
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Paramètres manquants" },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;

    // Le serveur ne fait jamais confiance au corps : une durée, une pause ou
    // un prix envoyé ici est une tentative de valeur déclarative, pas un
    // raccourci. On refuse explicitement au lieu d'ignorer en silence.
    const declarative = DECLARATIVE_FIELDS.filter((field) =>
      Object.prototype.hasOwnProperty.call(payload, field)
    );
    if (declarative.length > 0) {
      return NextResponse.json(
        { message: DECLARATIVE_MESSAGE },
        { status: 400 }
      );
    }

    const token = payload.token;
    const serviceId = payload.serviceId;
    const formuleId = payload.formuleId;

    if (
      typeof token !== "string" ||
      !token ||
      typeof serviceId !== "string" ||
      !serviceId
    ) {
      return NextResponse.json(
        { message: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Un formuleId non textuel ne doit pas retomber en silence sur les valeurs
    // du service : ce serait changer la durée demandée sans le dire.
    if (
      formuleId !== undefined &&
      formuleId !== null &&
      (typeof formuleId !== "string" || !formuleId)
    ) {
      return NextResponse.json(
        { message: "Paramètres invalides" },
        { status: 400 }
      );
    }

    const result = await performServiceChange({
      token,
      serviceId,
      formuleId:
        typeof formuleId === "string" && formuleId ? formuleId : undefined,
      actor: "client",
    });

    if (result.ok === false) {
      return NextResponse.json(
        { message: result.message },
        { status: result.status }
      );
    }

    // Scalaires seulement : jamais la description de l'événement (elle porte
    // le lien praticienne signé).
    return NextResponse.json({
      message: result.message,
      serviceName: result.serviceName,
      durationMin: result.durationMin,
      prix: result.prix,
      supplement: result.supplement,
      dateLabel: result.dateLabel,
      warning: result.warning,
    });
  } catch (error) {
    console.error(
      "Erreur changement de prestation :",
      error instanceof Error ? error.message : error
    );
    noterIncident("reservation", error, {
      route: "/api/booking/change-service",
      action: "changement de prestation",
    });
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
