// Orchestrateur unique du changement de prestation d'un rendez-vous déjà pris.
//
// Une seule implémentation, deux coquilles d'authentification :
//   - POST /api/booking/change-service  (cliente, jeton seul)
//   - POST /api/booking/owner           (praticienne, jeton + signature HMAC)
//
// Le corps de la requête ne fournit jamais la durée, la pause ni le prix :
// fetchBookingOption les résout dans Directus (service publié + réservable,
// formule publiée rattachée au service). Le patch se fait sur place, sur le
// même événement Google : même id, même début, même bookingToken.

import {
  BUSINESS_TIMEZONE,
  changeBookingService,
  findBookingByToken,
  getSlotAllowance,
  isSlotFree,
} from "@/lib/googleCalendar";
import { fetchBookingOption } from "@/lib/directus";
import { sendBrevoEmail } from "@/lib/brevo";
import {
  clientServiceChangedEmailHtml,
  ownerServiceChangedEmailHtml,
} from "@/lib/emails";
import { rewriteDescriptionFields } from "@/lib/eventDescription";
import {
  buildChangeServicePatch,
  validateServiceChange,
} from "@/lib/serviceChange";
import { formatDateLabel } from "@/lib/timezones";
import { buildOwnerUrl, ownerLinkAvailable } from "@/lib/ownerLink";

export type ServiceChangeActor = "client" | "owner";

export interface PerformServiceChangeInput {
  token: string;
  serviceId: string;
  formuleId?: string | null;
  actor: ServiceChangeActor;
}

export type PerformServiceChangeResult =
  | {
      ok: true;
      message: string;
      serviceName: string;
      durationMin: number;
      prix: number | null;
      supplement: number;
      /** Libellé de la date dans le fuseau de la cliente. */
      dateLabel: string;
      /** Libellé de la date dans le fuseau de la praticienne. */
      dateLabelOwner: string;
      warning?: string;
    }
  | { ok: false; status: 400 | 404 | 409 | 502; message: string };

/**
 * Origine des liens sortants : jamais l'en-tête `Host` de la requête (un POST
 * forgé pourrait y glisser un domaine tiers et faire partir un vrai mail avec
 * un lien praticienne signé vers ce domaine).
 */
export function siteOrigin(): string {
  const raw = (
    process.env.OWNER_LINK_ORIGIN ||
    process.env.SITE_URL ||
    "https://terrasigne.fr"
  ).trim();
  return raw.replace(/\/+$/, "");
}

/** Google répond 412 quand l'`If-Match` ne correspond plus (édition concurrente). */
function isPreconditionFailed(error: unknown): boolean {
  const e = error as {
    code?: number | string;
    status?: number;
    response?: { status?: number };
  } | null;
  return (
    e?.code === 412 ||
    e?.status === 412 ||
    e?.response?.status === 412
  );
}

/** Un identifiant Directus inconnu est une demande invalide, pas une panne. */
function isDirectusNotFound(error: unknown): boolean {
  return error instanceof Error && /Directus error 40[034]/.test(error.message);
}

export async function performServiceChange(
  input: PerformServiceChangeInput
): Promise<PerformServiceChangeResult> {
  // La description n'est lue qu'ici : elle contient le lien praticienne signé
  // et ne sort jamais d'une réponse HTTP.
  const booking = await findBookingByToken(input.token, {
    withDescription: true,
  });
  if (!booking) {
    return { ok: false, status: 404, message: "Rendez-vous introuvable" };
  }

  const start = new Date(booking.start);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, status: 400, message: "Ce rendez-vous est introuvable." };
  }

  let target;
  try {
    target = await fetchBookingOption(input.serviceId, input.formuleId);
  } catch (error) {
    // Panne Directus AVANT toute écriture : rien n'a bougé dans l'agenda.
    if (isDirectusNotFound(error)) {
      return {
        ok: false,
        status: 400,
        message: "Cette prestation n'est pas réservable.",
      };
    }
    console.error("Erreur Directus changement de prestation", {
      eventId: booking.id,
    });
    return {
      ok: false,
      status: 502,
      message: "La prestation n'a pas pu être vérifiée. Réessayez dans un instant.",
    };
  }

  if (!target) {
    return {
      ok: false,
      status: 400,
      message: "Cette prestation n'est pas réservable.",
    };
  }

  const dureeMin = Number(target.duree);
  const newEnd = new Date(start.getTime() + dureeMin * 60000);

  // Le début ne bouge pas : seule la fin s'étend (ou se réduit) à la nouvelle
  // durée. La plage ouverte et le chevauchement sont vérifiés AVANT le patch,
  // l'événement lui-même exclu du contrôle de chevauchement.
  const allowance = await getSlotAllowance(start, newEnd);
  const free = await isSlotFree(start, newEnd, booking.id);

  const validation = validateServiceChange({
    booking,
    target,
    allowed: allowance.allowed,
    free,
  });
  if (validation.ok === false) {
    return {
      ok: false,
      status: validation.status,
      message: validation.message,
    };
  }

  const supplement = allowance.supplement;
  const description = rewriteDescriptionFields(booking.description || "", {
    serviceName: target.titre,
    prix: target.prix,
    supplement,
  });
  const patch = buildChangeServicePatch({
    booking,
    target,
    supplement,
    description,
  });

  try {
    await changeBookingService(booking.id, patch);
  } catch (error) {
    if (isPreconditionFailed(error)) {
      return {
        ok: false,
        status: 409,
        message:
          "Ce rendez-vous a été modifié entre-temps. Rechargez la page et réessayez.",
      };
    }
    throw error;
  }

  // Journal d'audit sans donnée personnelle ni jeton : de quoi retrouver
  // l'événement et l'ancienne prestation si Cindy doit revenir en arrière.
  console.info("Changement de prestation", {
    eventId: booking.id,
    actor: input.actor,
    from: {
      serviceId: booking.serviceId,
      durationMin: booking.durationMin,
      supplement: booking.supplement,
    },
    to: {
      serviceId: target.serviceId,
      durationMin: dureeMin,
      supplement,
    },
  });

  const origin = siteOrigin();
  const clientTz = booking.clientTimezone || BUSINESS_TIMEZONE;
  const dateLabel = formatDateLabel(start, clientTz);
  const dateLabelOwner = formatDateLabel(start, BUSINESS_TIMEZONE);
  const manageUrl = `${origin}/rendez-vous/gerer?token=${encodeURIComponent(
    input.token
  )}`;
  const ownerManageUrl = ownerLinkAvailable()
    ? buildOwnerUrl(origin, input.token)
    : "";
  const oldServiceName = booking.serviceName || "Prestation précédente";
  const changedBy = input.actor;

  const failed: string[] = [];

  // Le patch est déjà fait : un échec Brevo ne défait rien et ne renvoie
  // jamais 502 — on répond 200 + warning (même motif que la page praticienne).
  try {
    await sendBrevoEmail({
      to: [{ email: booking.clientEmail, name: booking.clientName }],
      subject: `Prestation modifiée - ${target.titre}`,
      htmlContent: clientServiceChangedEmailHtml({
        name: booking.clientName,
        oldService: oldServiceName,
        newService: target.titre,
        dateLabel,
        durationMin: dureeMin,
        price: target.prix,
        supplement,
        changedBy,
        manageUrl,
      }),
      attachments: target.pdf
        ? [{ url: target.pdf.url, name: target.pdf.name }]
        : undefined,
    });
  } catch (error) {
    console.error("Erreur email changement de prestation (cliente)", {
      eventId: booking.id,
    });
    failed.push("l'email à la cliente n'a pas pu être envoyé");
  }

  const ownerEmail = process.env.GOOGLE_OWNER_EMAIL;
  if (ownerEmail) {
    try {
      await sendBrevoEmail({
        to: [{ email: ownerEmail }],
        subject:
          changedBy === "client"
            ? `Prestation modifiée par la cliente - ${oldServiceName} → ${target.titre}`
            : `Prestation modifiée - ${oldServiceName} → ${target.titre}`,
        htmlContent: ownerServiceChangedEmailHtml({
          name: booking.clientName,
          email: booking.clientEmail,
          phone: booking.phone,
          oldService: oldServiceName,
          newService: target.titre,
          dateLabel: dateLabelOwner,
          durationMin: dureeMin,
          price: target.prix,
          supplement,
          changedBy,
          manageUrl: ownerManageUrl || undefined,
        }),
      });
    } catch (error) {
      console.error("Erreur email changement de prestation (praticienne)", {
        eventId: booking.id,
      });
      failed.push("l'email récapitulatif n'a pas pu être envoyé");
    }
  }

  const warning = failed.length
    ? `Le rendez-vous est modifié, mais ${failed.join(" et ")}.`
    : undefined;

  return {
    ok: true,
    message: "Prestation modifiée.",
    serviceName: target.titre,
    durationMin: dureeMin,
    prix: target.prix,
    supplement,
    dateLabel,
    dateLabelOwner,
    warning,
  };
}
