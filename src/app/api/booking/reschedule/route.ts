import { NextResponse } from "next/server";
import {
  findBookingByToken,
  rescheduleBooking,
  isSlotFree,
  BUSINESS_TIMEZONE,
} from "@/lib/googleCalendar";
import { sendBrevoEmail } from "@/lib/brevo";
import { rescheduleEmailHtml } from "@/lib/emails";

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

    if (newStart.getTime() < Date.now()) {
      return NextResponse.json(
        { message: "Ce créneau est déjà passé" },
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

    await sendBrevoEmail({
      to: [{ email: existing.clientEmail, name: existing.clientName }],
      subject: `Rendez-vous modifié - ${existing.serviceName}`,
      htmlContent: rescheduleEmailHtml({
        name: existing.clientName,
        service: existing.serviceName,
        oldDateLabel,
        newDateLabel,
      }),
    });

    const ownerEmail = process.env.GOOGLE_OWNER_EMAIL;
    if (ownerEmail) {
      await sendBrevoEmail({
        to: [{ email: ownerEmail }],
        subject: `Rendez-vous modifié - ${existing.serviceName}`,
        textContent: `Rendez-vous déplacé.\nService : ${existing.serviceName}\nAncienne date : ${oldDateLabel}\nNouvelle date : ${newDateLabel}\nClient : ${existing.clientName}\nEmail : ${existing.clientEmail}`,
      });
    }

    return NextResponse.json({ message: "Rendez-vous modifié", dateLabel: newDateLabel });
  } catch (error) {
    console.error("Erreur modification RDV :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
