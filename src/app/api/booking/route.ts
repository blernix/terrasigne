import { NextResponse } from "next/server";
import { fetchService, getDirectusFileUrl } from "@/lib/directus";
import { createBookingEvent, isSlotFree, BUSINESS_TIMEZONE } from "@/lib/googleCalendar";
import { sendBrevoEmail, addContactToList } from "@/lib/brevo";
import { sendNewsletterConfirmation, getRequestOrigin } from "@/lib/newsletter";
import {
  bookingConfirmationEmailHtml,
  ownerNotificationEmailHtml,
} from "@/lib/emails";
import {
  resolveTimezone,
  getTimezoneLabel,
  formatDateLabel,
} from "@/lib/timezones";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
      prix: bodyPrix,
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
    const duration = Number(bodyDuree ?? service.duree);
    const pause = Number(bodyPause ?? (service.pause || 0));
    const prix = bodyPrix ?? service.prix;

    const pdf = service.pdf?.filename_disk
      ? {
          url: getDirectusFileUrl(service.pdf.filename_disk),
          name:
            service.pdf.filename_download ||
            `document-${service.pdf.filename_disk}`,
        }
      : null;
    if (service.rendez_vous !== true) {
      return NextResponse.json(
        { message: "Ce service n'est pas réservable" },
        { status: 400 }
      );
    }

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { message: "Ce service n'est pas réservable" },
        { status: 400 }
      );
    }

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

    if (startDate.getTime() < Date.now()) {
      return NextResponse.json(
        { message: "Ce créneau est déjà passé" },
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

    const event = await createBookingEvent({
      serviceName: service.titre,
      serviceId: String(service.id),
      durationMin: duration,
      pauseMin: pause,
      prix,
      pdf,
      bookingToken,
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
          message,
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
