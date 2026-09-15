import { NextResponse } from "next/server";
import { fetchService } from "@/lib/directus";
import { createBookingEvent, isSlotFree, BUSINESS_TIMEZONE } from "@/lib/googleCalendar";
import { sendBrevoEmail } from "@/lib/brevo";
import {
  bookingConfirmationEmailHtml,
  ownerNotificationEmailHtml,
} from "@/lib/emails";
import { resolveTimezone, getTimezoneLabel } from "@/lib/timezones";

function formatDateLabel(date: Date, timeZone: string): string {
  const label = new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

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
    const duration = Number(service.duree);
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

    const event = await createBookingEvent({
      serviceName: service.titre,
      prix: service.prix,
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

    await sendBrevoEmail({
      to: [{ email, name }],
      subject: `Confirmation de votre rendez-vous - ${service.titre}`,
      htmlContent: bookingConfirmationEmailHtml({
        service: service.titre,
        dateLabel,
        durationMin: duration,
        name,
        price: service.prix,
        timezoneLabel: getTimezoneLabel(clientTimezone),
      }),
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
          price: service.prix,
          message,
        }),
      });
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
