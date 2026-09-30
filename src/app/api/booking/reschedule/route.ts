import { NextResponse } from "next/server";
import {
  findBookingByToken,
  rescheduleBooking,
  isSlotFree,
  BUSINESS_TIMEZONE,
  MIN_LEAD_HOURS,
  MAX_AHEAD_DAYS,
} from "@/lib/googleCalendar";
import { sendBrevoEmail } from "@/lib/brevo";
import {
  rescheduleEmailHtml,
  ownerRescheduleEmailHtml,
} from "@/lib/emails";
import { formatDateLabel } from "@/lib/timezones";
import { getRequestOrigin } from "@/lib/newsletter";

export async function POST(req: Request) {
  try {
    const { token, start, end } = await req.json();
    if (!token || !start || !end) {
      return NextResponse.json(
        { message: "Paramètres manquants" },
        { status: 400 }
      );
    }

    const existing = await findBookingByToken(token);
    if (!existing) {
      return NextResponse.json(
        { message: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    const newStart = new Date(start);
    const newEnd = new Date(end);
    if (Number.isNaN(newStart.getTime()) || Number.isNaN(newEnd.getTime())) {
      return NextResponse.json({ message: "Dates invalides" }, { status: 400 });
    }

    if (
      existing.durationMin > 0 &&
      newEnd.getTime() - newStart.getTime() !== existing.durationMin * 60000
    ) {
      return NextResponse.json(
        { message: "Durée du créneau invalide" },
        { status: 400 }
      );
    }

    const minStart = Date.now() + MIN_LEAD_HOURS * 3600000;
    const maxStart = Date.now() + MAX_AHEAD_DAYS * 86400000;

    if (newStart.getTime() < minStart) {
      return NextResponse.json(
        {
          message: `Les réservations doivent être prises au moins ${MIN_LEAD_HOURS}h à l'avance`,
        },
        { status: 400 }
      );
    }

    if (newStart.getTime() > maxStart) {
      return NextResponse.json(
        { message: "Les réservations sont possibles jusqu'à 3 mois à l'avance" },
        { status: 400 }
      );
    }

    const free = await isSlotFree(newStart, newEnd, existing.id);
    if (!free) {
      return NextResponse.json(
        { message: "Ce créneau vient d'être réservé" },
        { status: 409 }
      );
    }

    const updated = await rescheduleBooking(token, newStart, newEnd);
    if (!updated) {
      return NextResponse.json(
        { message: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    const tz = existing.clientTimezone || BUSINESS_TIMEZONE;
    const oldDateLabel = formatDateLabel(new Date(existing.start), tz);
    const newDateLabel = formatDateLabel(newStart, tz);
    const ownerOldDateLabel = formatDateLabel(
      new Date(existing.start),
      BUSINESS_TIMEZONE
    );
    const ownerNewDateLabel = formatDateLabel(newStart, BUSINESS_TIMEZONE);
    const manageUrl = `${getRequestOrigin(req)}/rendez-vous/gerer?token=${token}`;

    await sendBrevoEmail({
      to: [{ email: existing.clientEmail, name: existing.clientName }],
      subject: `Rendez-vous modifié - ${existing.serviceName}`,
      htmlContent: rescheduleEmailHtml({
        name: existing.clientName,
        service: existing.serviceName,
        oldDateLabel,
        newDateLabel,
        manageUrl,
      }),
    });

    const ownerEmail = process.env.GOOGLE_OWNER_EMAIL;
    if (ownerEmail) {
      await sendBrevoEmail({
        to: [{ email: ownerEmail }],
        subject: `Rendez-vous modifié - ${existing.serviceName}`,
        htmlContent: ownerRescheduleEmailHtml({
          name: existing.clientName,
          email: existing.clientEmail,
          phone: existing.phone,
          service: existing.serviceName,
          oldDateLabel: ownerOldDateLabel,
          newDateLabel: ownerNewDateLabel,
        }),
      });
    }

    return NextResponse.json({ message: "Rendez-vous modifié", dateLabel: newDateLabel });
  } catch (error) {
    console.error("Erreur modification RDV :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
