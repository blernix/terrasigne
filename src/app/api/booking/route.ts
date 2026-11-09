import { NextResponse } from "next/server";
import { fetchService, getDirectusFileUrl } from "@/lib/directus";
import {
  createBookingEvent,
  isSlotFree,
  getSlotAllowance,
  BUSINESS_TIMEZONE,
  MIN_LEAD_HOURS,
  MAX_AHEAD_DAYS,
} from "@/lib/googleCalendar";
import { sendBrevoEmail, addContactToList } from "@/lib/brevo";
import { sendNewsletterConfirmation, getRequestOrigin } from "@/lib/newsletter";
import {
  bookingConfirmationEmailHtml,
  ownerNotificationEmailHtml,
  getZoomLink,
} from "@/lib/emails";
import {
  resolveTimezone,
  getTimezoneLabel,
  formatDateLabel,
} from "@/lib/timezones";
import { randomUUID } from "crypto";
import { buildOwnerUrl, ownerLinkAvailable } from "@/lib/ownerLink";

interface PublishedFormule {
  id: string;
  titre: string;
  duree: number;
  pause: number;
  prix: number | null;
}

/**
 * Formules publiées d'un service (même source que /api/services).
 * Le corps de la requête ne fait jamais foi pour la durée, la pause ou le prix :
 * seuls un service publié réservable ou une de ses formules publiées ouvrent
 * droit à une réservation. Ferme au passage le *pause poisoning* : une pause
 * démesurée envoyée par un client ne peut plus être stockée dans l'agenda.
 */
async function fetchPublishedFormules(
  serviceId: string
): Promise<PublishedFormule[]> {
  const api = process.env.NEXT_PUBLIC_DIRECTUS_API;
  if (!api) throw new Error("NEXT_PUBLIC_DIRECTUS_API manquante");

  const res = await fetch(
    `${api}/items/formule?fields=id,titre,duree,pause,prix&filter[service_id][_eq]=${encodeURIComponent(
      serviceId
    )}&filter[status][_eq]=published&limit=-1`,
    {
      headers: { Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}` },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`Directus error ${res.status}`);

  const { data } = await res.json();
  return (data || [])
    .map((f: any) => ({
      id: String(f.id),
      titre: f.titre || "",
      duree: Number(f.duree),
      pause: Number(f.pause || 0),
      prix: f.prix != null ? Number(f.prix) : null,
    }))
    .filter(
      (f: PublishedFormule) => Number.isFinite(f.duree) && f.duree > 0
    );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Préprod (terra.killian-lecrut.com) : aucune écriture réelle — ni agenda,
    // ni email — tant que PREPROD_MODE=1. La production n'est pas concernée.
    if (process.env.PREPROD_MODE === "1") {
      return NextResponse.json(
        { message: "Réservation désactivée sur la préprod : aucun rendez-vous n'est créé ici." },
        { status: 403 }
      );
    }

    const {
      serviceId,
      start,
      end,
      firstName,
      lastName,
      email,
      phone,
      meetingType,
      profession,
      suivi,
      typeSeance,
      message,
      consent,
      newsletter,
      duree: bodyDuree,
      pause: bodyPause,
      timezone,
    } = body;
    const clientTimezone = resolveTimezone(timezone);
    const name = `${firstName || ""} ${lastName || ""}`.trim();

    if (
      !serviceId ||
      !start ||
      !end ||
      !firstName ||
      !lastName ||
      !email ||
      !meetingType ||
      !profession ||
      !suivi ||
      !consent
    ) {
      return NextResponse.json(
        { message: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    const service = await fetchService(String(serviceId));

    if (service.rendez_vous !== true) {
      return NextResponse.json(
        { message: "Ce service n'est pas réservable" },
        { status: 400 }
      );
    }

    const requestedDuration = Number(bodyDuree ?? service.duree);
    const requestedPause = Number(bodyPause ?? (service.pause || 0));
    if (!Number.isFinite(requestedDuration) || requestedDuration <= 0) {
      return NextResponse.json(
        { message: "Ce service n'est pas réservable" },
        { status: 400 }
      );
    }

    // Le corps ne fait pas foi : la durée et la pause doivent correspondre à
    // une formule publiée du service, ou aux valeurs du service lui-même.
    // Le prix vient de Directus, jamais du corps de la requête.
    const formules = await fetchPublishedFormules(String(serviceId));
    const matchedFormule = formules.find(
      (f) => f.duree === requestedDuration && f.pause === requestedPause
    );
    const serviceDuration = Number(service.duree);
    const servicePause = Number(service.pause || 0);

    let duration: number;
    let pause: number;
    let prix: number | null;

    if (matchedFormule) {
      duration = matchedFormule.duree;
      pause = matchedFormule.pause;
      prix = matchedFormule.prix ?? service.prix;
    } else if (
      requestedDuration === serviceDuration &&
      requestedPause === servicePause
    ) {
      duration = serviceDuration;
      pause = servicePause;
      prix = service.prix;
    } else {
      return NextResponse.json(
        {
          message:
            "Cette durée ne correspond pas à une prestation réservable.",
        },
        { status: 400 }
      );
    }

    const pdf = service.pdf?.filename_disk
      ? {
          url: getDirectusFileUrl(service.pdf.filename_disk),
          name:
            service.pdf.filename_download ||
            `document-${service.pdf.filename_disk}`,
        }
      : null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: "Dates invalides" },
        { status: 400 }
      );
    }

    if (endDate.getTime() - startDate.getTime() !== duration * 60000) {
      return NextResponse.json(
        { message: "Durée du créneau invalide" },
        { status: 400 }
      );
    }

    // Le créneau doit être entièrement contenu dans une plage ouverte de
    // l'agenda (aucune marge) ; le supplément vient de la plage elle-même.
    const allowance = await getSlotAllowance(startDate, endDate);
    if (!allowance.allowed) {
      return NextResponse.json(
        { message: "Ce créneau n'est pas proposé à la réservation." },
        { status: 400 }
      );
    }
    const supplement = allowance.supplement;

    const minStart = Date.now() + MIN_LEAD_HOURS * 3600000;
    const maxStart = Date.now() + MAX_AHEAD_DAYS * 86400000;

    if (startDate.getTime() < minStart) {
      return NextResponse.json(
        {
          message: `Les réservations doivent être prises au moins ${MIN_LEAD_HOURS}h à l'avance`,
        },
        { status: 400 }
      );
    }

    if (startDate.getTime() > maxStart) {
      return NextResponse.json(
        { message: "Les réservations sont possibles jusqu'à 3 mois à l'avance" },
        { status: 400 }
      );
    }

    const free = await isSlotFree(startDate, endDate);
    if (!free) {
      return NextResponse.json(
        { message: "Ce créneau vient d'être réservé" },
        { status: 409 }
      );
    }

    const bookingToken = randomUUID();
    const siteUrl = getRequestOrigin(req);
    // Lien signé de la page praticienne : présent dans la description de
    // l'événement Google et dans le mail reçu par Cindy. Vide si le secret
    // n'est pas configuré → on n'envoie pas de lien mort.
    const ownerManageUrl = ownerLinkAvailable()
      ? buildOwnerUrl(siteUrl, bookingToken)
      : "";
    const consentAt = consent ? new Date().toISOString() : "";
    const zoomLink = getZoomLink(meetingType);

    const event = await createBookingEvent({
      serviceName: service.titre,
      serviceId: String(service.id),
      durationMin: duration,
      pauseMin: pause,
      prix,
      pdf,
      supplement,
      bookingToken,
      ownerManageUrl: ownerManageUrl || undefined,
      consentAt,
      zoomLink,
      start: startDate,
      end: endDate,
      clientTimezone,
      client: {
        name,
        email,
        phone,
        meetingType,
        profession,
        suivi,
        typeSeance,
        message,
        consent: Boolean(consent),
      },
    });

    const dateLabel = formatDateLabel(startDate, clientTimezone);
    const ownerDateLabel = formatDateLabel(startDate, BUSINESS_TIMEZONE);
    const manageUrl = `${siteUrl}/rendez-vous/gerer?token=${bookingToken}`;

    await sendBrevoEmail({
      to: [{ email, name }],
      subject: `Confirmation de votre rendez-vous - ${service.titre}`,
      htmlContent: bookingConfirmationEmailHtml({
        service: service.titre,
        dateLabel,
        durationMin: duration,
        name,
        price: prix,
        timezoneLabel: getTimezoneLabel(clientTimezone),
        manageUrl,
        pdfNote: Boolean(pdf),
        zoomLink,
        supplement,
      }),
      attachments: pdf ? [{ url: pdf.url, name: pdf.name }] : undefined,
    });

    const ownerEmail = process.env.GOOGLE_OWNER_EMAIL;
    if (ownerEmail) {
      await sendBrevoEmail({
        to: [{ email: ownerEmail }],
        subject: `Nouveau rendez-vous - ${service.titre}`,
        htmlContent: ownerNotificationEmailHtml({
          service: service.titre,
          dateLabel: ownerDateLabel,
          name,
          email,
          phone,
          meetingType,
          profession,
          suivi,
          typeSeance,
          price: prix,
          supplement,
          message,
          zoomLink,
          manageUrl: ownerManageUrl || undefined,
        }),
      });
    }

    const bookingListId = Number(process.env.BREVO_BOOKING_LIST_ID);
    if (bookingListId) {
      try {
        await addContactToList({
          email,
          listIds: [bookingListId],
          attributes: {
            FIRSTNAME: firstName || "",
            LASTNAME: lastName || "",
          },
        });
      } catch (e) {
        console.error("Erreur ajout contact Brevo (RDV) :", e);
      }

      if (newsletter) {
        const newsletterListId = Number(process.env.BREVO_NEWSLETTER_LIST_ID);
        if (newsletterListId) {
          try {
            await sendNewsletterConfirmation(email, [newsletterListId], siteUrl);
          } catch (e) {
            console.error("Erreur envoi confirmation newsletter :", e);
          }
        }
      }
    }

    return NextResponse.json({
      message: "Rendez-vous confirmé",
      eventId: event.id,
      dateLabel,
    });
  } catch (error) {
    console.error("Erreur API réservation :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
