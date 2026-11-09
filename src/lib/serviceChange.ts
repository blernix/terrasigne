// Socle pur du changement de prestation d'un rendez-vous déjà pris.
//
// Aucune écriture ici : ce module valide la demande et construit les champs à
// patcher sur l'événement Google existant (même eventId, même bookingToken,
// même place dans l'agenda). Les valeurs de durée, pause et prix viennent
// toujours de Directus (fetchBookingOption), jamais du corps de la requête.
//
// Module volontairement sans import (comme plages.ts et eventDescription.ts) :
// scripts/test-prestation.mjs l'importe avec node --experimental-strip-types,
// hors build Next.

/** Délai minimum avant un rendez-vous pour pouvoir en changer la prestation. */
export const SERVICE_CHANGE_MIN_LEAD_HOURS = 48;

/** Prestation résolue dans Directus, seule source de la durée, de la pause et du prix. */
export interface ServiceChangeTarget {
  serviceId: string;
  titre: string;
  duree: number;
  pause: number;
  prix: number | null;
  pdf: { name: string; url: string } | null;
}

/** Rendez-vous existant, tel que lu dans l'agenda avant le patch. */
export interface ServiceChangeBooking {
  id: string;
  token: string;
  start: string | Date;
  summary?: string;
  clientName?: string;
  /** Propriétés privées existantes : conservées par étalement, jamais reconstruites. */
  privateProps?: Record<string, string>;
}

export interface ValidateServiceChangeInput {
  booking: ServiceChangeBooking;
  target: ServiceChangeTarget | null | undefined;
  /** Résultat de getSlotAllowance : le nouveau créneau tient dans une plage ouverte. */
  allowed: boolean;
  /** Résultat de isSlotFree : aucun autre rendez-vous ne chevauche le nouveau créneau. */
  free: boolean;
  now?: Date | number;
  minLeadHours?: number;
}

export type ServiceChangeValidation =
  | { ok: true }
  | { ok: false; status: 400 | 409; message: string };

/**
 * Valide un changement de prestation. Ordre volontaire : la prestation, puis le
 * délai, puis la plage, puis le chevauchement — le message affiché est celui du
 * premier obstacle réel, jamais « Erreur serveur ».
 */
export function validateServiceChange(
  input: ValidateServiceChangeInput
): ServiceChangeValidation {
  const { booking, target } = input;

  if (!target) {
    return {
      ok: false,
      status: 400,
      message: "Cette prestation n'est pas proposée à la réservation.",
    };
  }

  const duree = Number(target.duree);
  const pause = Number(target.pause);
  if (!Number.isFinite(duree) || duree <= 0) {
    return {
      ok: false,
      status: 400,
      message: "La durée de cette prestation est invalide.",
    };
  }
  if (!Number.isFinite(pause) || pause < 0) {
    return {
      ok: false,
      status: 400,
      message: "La pause de cette prestation est invalide.",
    };
  }

  const startMs = new Date(booking.start).getTime();
  if (Number.isNaN(startMs)) {
    return {
      ok: false,
      status: 400,
      message: "Ce rendez-vous est introuvable.",
    };
  }

  const leadHours = Number.isFinite(Number(input.minLeadHours))
    ? Number(input.minLeadHours)
    : SERVICE_CHANGE_MIN_LEAD_HOURS;
  const nowMs =
    input.now === undefined
      ? Date.now()
      : input.now instanceof Date
        ? input.now.getTime()
        : Number(input.now);
  if (!Number.isFinite(nowMs)) {
    return {
      ok: false,
      status: 400,
      message: "Ce rendez-vous est introuvable.",
    };
  }

  if (startMs <= nowMs) {
    return {
      ok: false,
      status: 400,
      message: "Ce rendez-vous est passé : il ne peut plus être modifié.",
    };
  }
  if (startMs < nowMs + leadHours * 3600000) {
    return {
      ok: false,
      status: 400,
      message: `Ce rendez-vous a lieu dans moins de ${leadHours} h : il ne peut plus être modifié.`,
    };
  }

  if (input.allowed === false) {
    return {
      ok: false,
      status: 400,
      message: "Ce créneau n'est pas proposé à la réservation.",
    };
  }

  if (input.free === false) {
    return {
      ok: false,
      status: 409,
      message: "Ce créneau chevauche un autre rendez-vous.",
    };
  }

  return { ok: true };
}

export interface BuildChangeServicePatchInput {
  booking: ServiceChangeBooking;
  target: ServiceChangeTarget;
  /** Supplément de la plage du créneau, recalculé côté serveur (0 = normal). */
  supplement: number;
  /** Description déjà réécrite par rewriteDescriptionFields. */
  description: string;
}

/** Champs à passer tels quels à events.patch sur l'événement existant. */
export interface ServiceChangePatch {
  summary: string;
  /** Fin recalculée : le début du rendez-vous ne bouge jamais. */
  end: string;
  description: string;
  privateProps: Record<string, string>;
}

/**
 * Construit le patch du changement de prestation.
 *
 * - `start` n'est pas dans le patch : la place dans l'agenda est conservée ;
 * - `bookingToken` n'est jamais réécrit : il survit par étalement des
 *   propriétés existantes, comme `consentAt`, `clientEmail` ou `meetingType` ;
 * - l'ancien document PDF est remplacé, ou vidé si la nouvelle prestation n'en
 *   a pas (sinon le rappel suivant joindrait le document de l'ancienne).
 */
export function buildChangeServicePatch(
  input: BuildChangeServicePatchInput
): ServiceChangePatch {
  const { booking, target, supplement, description } = input;

  const startMs = new Date(booking.start).getTime();
  const dureeMin = Number(target.duree);
  const end = new Date(startMs + dureeMin * 60000);

  const clientName = String(booking.clientName || "").trim();
  const summary = clientName
    ? `RDV ${target.titre} - ${clientName}`
    : `RDV ${target.titre}`;

  const privateProps: Record<string, string> = {
    ...(booking.privateProps || {}),
    serviceId: String(target.serviceId),
    serviceName: target.titre,
    durationMin: String(dureeMin),
    pauseMin: String(Number(target.pause) || 0),
    prix: String(Number.isFinite(Number(target.prix)) ? Number(target.prix) : 0),
    supplement: String(Number(supplement) || 0),
    pdfName: target.pdf?.name || "",
    pdfUrl: target.pdf?.url || "",
    // La date ne bouge pas, mais la prestation change : les deux rappels
    // doivent repartir pour annoncer la nouvelle prestation.
    reminderSent: "false",
    ownerReminderSent: "false",
  };

  return {
    summary,
    end: end.toISOString(),
    description,
    privateProps,
  };
}
